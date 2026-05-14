import User from '../models/User.js';
import CodingStat from '../models/CodingStat.js';
import GithubStat from '../models/GithubStat.js';
import ActivityLog from '../models/ActivityLog.js';
import ImmersionExam from '../models/ImmersionExam.js';
import ImmersionResult from '../models/ImmersionResult.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const RISK_DAYS = 5;
const RISK_STREAK = 0;
const RISK_SOLVED = 30;
const RISK_SCORE  = 500;

function isAtRisk(user, cs) {
  if (!cs) return { isAtRisk: true, riskReason: 'No coding activity recorded' };
  const daysSince = user.lastActive
    ? (Date.now() - new Date(user.lastActive).getTime()) / 86400000 : 999;
  if (daysSince > RISK_DAYS) return { isAtRisk: true, riskReason: 'Inactive for 5+ days' };
  if ((cs.leetcode?.currentStreak ?? 0) === RISK_STREAK && (cs.combined?.totalSolved ?? 0) > 0)
    return { isAtRisk: true, riskReason: 'Streak broken' };
  if ((cs.combined?.totalSolved ?? 0) < RISK_SOLVED)
    return { isAtRisk: true, riskReason: 'Low problems solved' };
  if ((cs.leetcodeScore ?? 0) < RISK_SCORE)
    return { isAtRisk: true, riskReason: 'Low score' };
  return { isAtRisk: false, riskReason: null };
}

function buildStudentRow(user, cs, gs) {
  const { isAtRisk: atRisk, riskReason } = isAtRisk(user, cs);
  const daysSince = user.lastActive
    ? Math.floor((Date.now() - new Date(user.lastActive).getTime()) / 86400000) : 0;
  const totalScore = (cs?.leetcodeScore ?? 0) + (gs?.githubScore ?? 0);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || '',
    batch: user.batch || '',
    branch: user.branch || '',
    problemsSolved: cs?.combined?.totalSolved ?? 0,
    streak: cs?.leetcode?.currentStreak ?? 0,
    githubCommits: gs?.totalCommits ?? 0,
    score: totalScore,
    growth: 0,
    status: daysSince <= 2 ? 'Active' : 'Inactive',
    lastActive: user.lastActive,
    inactiveDays: daysSince,
    isAtRisk: atRisk,
    riskReason,
    codingStats: {
      totalSolved: cs?.combined?.totalSolved ?? 0,
      easy:   cs?.combined?.easy   ?? { solved: 0, total: 600 },
      medium: cs?.combined?.medium ?? { solved: 0, total: 600 },
      hard:   cs?.combined?.hard   ?? { solved: 0, total: 300 },
    },
    recentActivity: [],
  };
}

export const getOverview = asyncHandler(async (req, res) => {
  const twoDaysAgo  = new Date(Date.now() - 2  * 86400000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

  const [totalStudents, activeStudents, allCodingStats] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', lastActive: { $gte: twoDaysAgo } }),
    CodingStat.find({}).lean(),
  ]);

  const inactiveStudents = totalStudents - activeStudents;
  const avgProblemsSolved = allCodingStats.length
    ? allCodingStats.reduce((s, c) => s + (c.combined?.totalSolved ?? 0), 0) / allCodingStats.length
    : 0;
  const avgStreak = allCodingStats.length
    ? allCodingStats.reduce((s, c) => s + (c.leetcode?.currentStreak ?? 0), 0) / allCodingStats.length
    : 0;

  res.json({
    success: true,
    data: {
      profile: {
        _id: req.user._id, name: req.user.name, email: req.user.email,
        role: req.user.role, avatarUrl: req.user.avatarUrl,
        batch: req.user.batch, branch: req.user.branch,
      },
      overview: {
        totalStudents, totalStudentsChange: 0,
        activeStudents, activeStudentsChange: 0,
        inactiveStudents, inactiveStudentsChange: 0,
        avgProblemsSolved: Math.round(avgProblemsSolved * 10) / 10, avgProblemsSolvedChange: 0,
        avgStreak: Math.round(avgStreak * 10) / 10, avgStreakChange: 0,
      },
    },
  });
});

export const getStudents = asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page  ?? 1));
  const limit  = Math.min(100, parseInt(req.query.limit ?? 20));
  const search = req.query.search ?? '';
  const filter = req.query.filter ?? 'all';
  const skip   = (page - 1) * limit;

  const query = { role: 'student' };
  if (search) query.name = { $regex: search, $options: 'i' };

  const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
  if (filter === 'active')   query.lastActive = { $gte: twoDaysAgo };
  if (filter === 'inactive') query.lastActive = { $lt:  twoDaysAgo };

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  const userIds = users.map((u) => u._id);
  const [codingStats, githubStats] = await Promise.all([
    CodingStat.find({ userId: { $in: userIds } }).lean(),
    GithubStat.find({ userId: { $in: userIds } }).lean(),
  ]);

  const csMap = new Map(codingStats.map((c) => [String(c.userId), c]));
  const gsMap = new Map(githubStats.map((g) => [String(g.userId), g]));

  let rows = users.map((u) => buildStudentRow(u, csMap.get(String(u._id)), gsMap.get(String(u._id))));

  if (filter === 'top')     rows = rows.filter((r) => r.score >= 1000);
  if (filter === 'at-risk') rows = rows.filter((r) => r.isAtRisk);

  const finalTotal = ['top', 'at-risk'].includes(filter) ? rows.length : total;

  res.json({
    success: true,
    data: {
      rows,
      total: finalTotal,
      page,
      limit,
      totalPages: Math.ceil(finalTotal / limit),
    },
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: 'student' }).lean();
  if (!student) throw new ApiError(404, 'Student not found');

  const [cs, gs, activity] = await Promise.all([
    CodingStat.findOne({ userId: student._id }).lean(),
    GithubStat.findOne({ userId: student._id }).lean(),
    ActivityLog.find({ userId: student._id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const row = buildStudentRow(student, cs, gs);
  row.recentActivity = activity.map((a) => ({ type: a.type, text: a.text, date: a.createdAt }));

  res.json({ success: true, data: row });
});

export const getActivityTrend = asyncHandler(async (req, res) => {
  const days = 7;
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    trend.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgProblems: 0,
      totalActivity: 0,
    });
  }
  res.json({ success: true, data: trend });
});

export const getTopPerformers = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit ?? 5));

  const topCS = await CodingStat.find({})
    .sort({ leetcodeScore: -1 }).limit(limit).lean();

  const userIds = topCS.map((c) => c.userId);
  const [users, githubStats] = await Promise.all([
    User.find({ _id: { $in: userIds } }).lean(),
    GithubStat.find({ userId: { $in: userIds } }).lean(),
  ]);

  const usersMap = new Map(users.map((u) => [String(u._id), u]));
  const gsMap    = new Map(githubStats.map((g) => [String(g.userId), g]));

  const rows = topCS.map((cs, i) => {
    const u  = usersMap.get(String(cs.userId)) ?? {};
    const gs = gsMap.get(String(cs.userId));
    return { ...buildStudentRow(u, cs, gs), rank: i + 1, medal: ['🥇','🥈','🥉','4','5'][i] ?? String(i + 1) };
  });

  res.json({ success: true, data: rows });
});

export const getAtRisk = asyncHandler(async (req, res) => {
  const fiveDaysAgo = new Date(Date.now() - RISK_DAYS * 86400000);
  const atRiskUsers = await User.find({
    role: 'student',
    $or: [{ lastActive: { $lt: fiveDaysAgo } }, { lastActive: null }],
  }).limit(20).lean();

  const atRiskFromScores = await CodingStat.find({
    $or: [
      { 'combined.totalSolved': { $lt: RISK_SOLVED } },
      { leetcodeScore: { $lt: RISK_SCORE } },
      { 'leetcode.currentStreak': RISK_STREAK },
    ],
  }).limit(20).lean();

  const allUserIds = new Set([
    ...atRiskUsers.map((u) => String(u._id)),
    ...atRiskFromScores.map((c) => String(c.userId)),
  ]);

  const [users, codingStats, githubStats] = await Promise.all([
    User.find({ _id: { $in: [...allUserIds] } }).lean(),
    CodingStat.find({ userId: { $in: [...allUserIds] } }).lean(),
    GithubStat.find({ userId: { $in: [...allUserIds] } }).lean(),
  ]);

  const csMap = new Map(codingStats.map((c) => [String(c.userId), c]));
  const gsMap = new Map(githubStats.map((g) => [String(g.userId), g]));

  const rows = users
    .map((u) => buildStudentRow(u, csMap.get(String(u._id)), gsMap.get(String(u._id))))
    .filter((r) => r.isAtRisk)
    .slice(0, 10);

  res.json({ success: true, data: rows });
});

export const getInsights = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const [inactiveCount, totalStudents] = await Promise.all([
    User.countDocuments({ role: 'student', lastActive: { $lt: sevenDaysAgo } }),
    User.countDocuments({ role: 'student' }),
  ]);

  const insights = [];
  if (inactiveCount > 0)
    insights.push({ type: 'warning', text: `${inactiveCount} students are inactive this week.` });
  insights.push({ type: 'info', text: `${totalStudents} total students registered in the system.` });
  insights.push({ type: 'positive', text: 'Leaderboard is updated daily. Check top performers!' });

  res.json({ success: true, data: insights });
});

export const getImmersionExamLatest = asyncHandler(async (req, res) => {
  const [current, weeklyTrend] = await Promise.all([
    ImmersionExam.findOne({ isPublished: true }).sort({ week: -1 }).lean(),
    ImmersionExam.find({ isPublished: true }).sort({ week: 1 }).limit(6).lean(),
  ]);

  if (!current) {
    return res.json({ success: true, data: { current: null, upcoming: null, weeklyTrend: [] } });
  }

  res.json({
    success: true,
    data: {
      current,
      upcoming: null,
      weeklyTrend: weeklyTrend.map((e) => ({
        week: `Wk ${e.week}`, avgScore: e.avgScore ?? 0, topic: e.topic ?? '',
      })),
    },
  });
});

export const getImmersionResults = asyncHandler(async (req, res) => {
  const week = parseInt(req.params.week);
  const results = await ImmersionResult.find({ week })
    .sort({ marks: -1 }).populate('userId', 'name avatarUrl branch').lean();

  const rows = results.map((r, i) => ({
    _id: r._id, name: r.userId?.name ?? '', avatarUrl: r.userId?.avatarUrl ?? '',
    branch: r.userId?.branch ?? '', marks: r.marks, status: r.status,
    grade: r.grade, weakArea: r.weakArea, rank: i + 1,
  }));

  res.json({ success: true, data: rows });
});

export const createImmersionExam = asyncHandler(async (req, res) => {
  const { week, topic, date, duration } = req.body;
  if (!week) throw new ApiError(400, 'Week number is required');

  const exam = await ImmersionExam.findOneAndUpdate(
    { week },
    { $set: { week, topic, date, duration, totalStudents: await User.countDocuments({ role: 'student' }) } },
    { upsert: true, new: true }
  );
  res.status(201).json({ success: true, data: exam });
});

export const uploadImmersionResults = asyncHandler(async (req, res) => {
  const week    = parseInt(req.params.week);
  const results = req.body.results ?? [];
  if (!results.length) throw new ApiError(400, 'No results provided');

  let inserted = 0, updated = 0;
  for (const r of results) {
    const marks   = r.marks;
    const status  = marks >= 40 ? 'Pass' : 'Fail';
    const grade   = marks >= 75 ? 'Good' : marks >= 50 ? 'Average' : 'Poor';
    const weakArea = marks < 75 ? 'Review required' : null;

    const res2 = await ImmersionResult.findOneAndUpdate(
      { userId: r.userId, week },
      { $set: { marks, status, grade, weakArea } },
      { upsert: true, new: true, rawResult: true }
    );
    res2.lastErrorObject?.updatedExisting ? updated++ : inserted++;
  }

  const allResults = await ImmersionResult.find({ week }).sort({ marks: -1 });
  for (let i = 0; i < allResults.length; i++) {
    allResults[i].rank = i + 1;
    await allResults[i].save();
  }

  const marks   = allResults.map((r) => r.marks);
  const appeared = marks.length;
  const passed   = marks.filter((m) => m >= 40).length;
  const avgScore = appeared ? marks.reduce((s, m) => s + m, 0) / appeared : 0;
  const ranges   = ['0–20','21–40','41–60','61–80','81–100'];
  const scoreDistribution = ranges.map((range, i) => {
    const [lo, hi] = range.split('–').map(Number);
    return { range, count: marks.filter((m) => m >= lo && m <= hi).length };
  });

  await ImmersionExam.findOneAndUpdate(
    { week },
    { $set: { appeared, passed, avgScore: Math.round(avgScore * 10) / 10,
        highestScore: Math.max(...marks), lowestScore: Math.min(...marks),
        passPercent: appeared ? Math.round(passed / appeared * 1000) / 10 : 0,
        scoreDistribution, isPublished: true } }
  );

  res.json({ success: true, data: { inserted, updated } });
});
