import User from '../models/User.js';
import CodingStat from '../models/CodingStat.js';
import GithubStat from '../models/GithubStat.js';
import ActivityLog from '../models/ActivityLog.js';
import ImmersionExam from '../models/ImmersionExam.js';
import ImmersionResult from '../models/ImmersionResult.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getPagination } from '../utils/paginate.js';

const TWO_DAYS_AGO  = () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const FIVE_DAYS_AGO = () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
const SEVEN_DAYS_AGO= () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const AT_RISK_SCORE = 500;
const AT_RISK_SOLVED = 30;

export const getOverview = asyncHandler(async (req, res) => {
  const [total, active, aggregate] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', lastActive: { $gte: TWO_DAYS_AGO() } }),
    CodingStat.aggregate([
      {
        $group: {
          _id:            null,
          avgSolved:      { $avg: '$combined.totalSolved' },
          avgStreak:      { $avg: '$leetcode.currentStreak' },
        },
      },
    ]),
  ]);

  const inactive = total - active;
  const agg = aggregate[0] ?? {};

  res.json({
    success: true,
    data: {
      profile: {
        _id:      req.user._id,
        name:     req.user.name,
        email:    req.user.email,
        role:     req.user.role,
        avatarUrl:req.user.avatarUrl,
      },
      overview: {
        totalStudents:          total,
        totalStudentsChange:    0,
        activeStudents:         active,
        activeStudentsChange:   0,
        inactiveStudents:       inactive,
        inactiveStudentsChange: 0,
        avgProblemsSolved:      Math.round((agg.avgSolved ?? 0) * 10) / 10,
        avgProblemsSolvedChange:0,
        avgStreak:              Math.round((agg.avgStreak ?? 0) * 10) / 10,
        avgStreakChange:        0,
      },
    },
  });
});

export const getStudents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, filter } = req.query;

  const userQuery = { role: 'student' };
  if (search) userQuery.name = { $regex: search, $options: 'i' };
  if (filter === 'active')   userQuery.lastActive = { $gte: TWO_DAYS_AGO() };
  if (filter === 'inactive') userQuery.lastActive = { $lt: TWO_DAYS_AGO() };

  const [users, total] = await Promise.all([
    User.find(userQuery).skip(skip).limit(limit).lean(),
    User.countDocuments(userQuery),
  ]);

  const userIds = users.map((u) => u._id);
  const [codingStats, githubStats] = await Promise.all([
    CodingStat.find({ userId: { $in: userIds } }).lean(),
    GithubStat.find({ userId: { $in: userIds } }).lean(),
  ]);

  const codingMap = Object.fromEntries(codingStats.map((s) => [String(s.userId), s]));
  const githubMap = Object.fromEntries(githubStats.map((s) => [String(s.userId), s]));

  let rows = users.map((u) => {
    const cs = codingMap[String(u._id)];
    const gs = githubMap[String(u._id)];
    const score = (cs?.leetcodeScore ?? 0) + (gs?.githubScore ?? 0);
    const isAtRisk = (
      !u.lastActive || u.lastActive < FIVE_DAYS_AGO() ||
      (cs?.leetcode?.currentStreak ?? 0) === 0 ||
      (cs?.combined?.totalSolved ?? 0) < AT_RISK_SOLVED ||
      (cs?.leetcodeScore ?? 0) < AT_RISK_SCORE
    );

    const riskReason = !u.lastActive || u.lastActive < FIVE_DAYS_AGO()
      ? 'Inactive for 5+ days'
      : (cs?.leetcode?.currentStreak ?? 0) === 0
        ? 'No active streak'
        : (cs?.combined?.totalSolved ?? 0) < AT_RISK_SOLVED
          ? 'Low problems solved'
          : (cs?.leetcodeScore ?? 0) < AT_RISK_SCORE
            ? 'Low score'
            : null;

    return {
      _id:          u._id,
      name:         u.name,
      email:        u.email,
      avatarUrl:    u.avatarUrl,
      batch:        u.batch,
      branch:       u.branch,
      problemsSolved: cs?.combined?.totalSolved ?? cs?.leetcode?.totalSolved ?? 0,
      streak:       cs?.leetcode?.currentStreak ?? 0,
      githubCommits:gs?.totalCommits ?? 0,
      score,
      growth:       0,
      status:       u.lastActive >= TWO_DAYS_AGO() ? 'Active' : 'Inactive',
      lastActive:   u.lastActive,
      isAtRisk,
      riskReason,
    };
  });

  if (filter === 'top')     rows = rows.filter((r) => r.score >= 1500);
  if (filter === 'at-risk') rows = rows.filter((r) => r.isAtRisk);

  res.json({
    success: true,
    data: { rows, total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const [user, cs, gs, activity] = await Promise.all([
    User.findById(req.params.id).select('-passwordHash').lean(),
    CodingStat.findOne({ userId: req.params.id }).lean(),
    GithubStat.findOne({ userId: req.params.id }).lean(),
    ActivityLog.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  if (!user) throw new ApiError(404, 'Student not found');
  res.json({ success: true, data: { ...user, codingStat: cs, githubStat: gs, activity } });
});

export const getActivityTrend = asyncHandler(async (req, res) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const trend = labels.map((day, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return { date: day, totalActivity: 0, avgProblems: 0 };
  });
  res.json({ success: true, data: trend });
});

export const getTopPerformers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit ?? 5);
  const top = await CodingStat.aggregate([
    { $sort: { leetcodeScore: -1 } },
    { $limit: limit },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        _id:           '$user._id',
        name:          '$user.name',
        avatarUrl:     '$user.avatarUrl',
        batch:         '$user.batch',
        branch:        '$user.branch',
        leetcodeScore: 1,
        totalSolved:   '$combined.totalSolved',
        streak:        '$leetcode.currentStreak',
      },
    },
  ]);
  res.json({ success: true, data: top });
});

export const getAtRiskStudents = asyncHandler(async (req, res) => {
  const atRiskStats = await CodingStat.find({
    $or: [
      { leetcodeScore: { $lt: AT_RISK_SCORE } },
      { 'leetcode.currentStreak': 0 },
      { 'combined.totalSolved': { $lt: AT_RISK_SOLVED } },
    ],
  })
    .populate('userId', 'name avatarUrl email batch branch lastActive')
    .limit(10)
    .lean();

  const rows = atRiskStats
    .filter((s) => s.userId)
    .map((s) => {
      const u = s.userId;
      const isInactive = !u.lastActive || u.lastActive < FIVE_DAYS_AGO();
      const riskReason = isInactive
        ? 'Inactive for 5+ days'
        : s.leetcode?.currentStreak === 0
          ? 'No active streak'
          : (s.combined?.totalSolved ?? 0) < AT_RISK_SOLVED
            ? 'Low problems solved'
            : 'Low score';

      return {
        _id:          u._id,
        name:         u.name,
        avatarUrl:    u.avatarUrl,
        email:        u.email,
        batch:        u.batch,
        branch:       u.branch,
        lastActive:   u.lastActive,
        streak:       s.leetcode?.currentStreak ?? 0,
        problemsSolved: s.combined?.totalSolved ?? 0,
        score:        s.leetcodeScore,
        riskReason,
        isAtRisk:     true,
      };
    });

  res.json({ success: true, data: rows });
});

export const getInsights = asyncHandler(async (req, res) => {
  const [inactiveCount, noSubmitStats] = await Promise.all([
    User.countDocuments({ role: 'student', lastActive: { $lt: SEVEN_DAYS_AGO() } }),
    CodingStat.countDocuments({ 'leetcode.currentStreak': 0 }),
  ]);

  const insights = [];
  if (inactiveCount > 0) {
    insights.push({
      type: 'alert',
      message: `${inactiveCount} student${inactiveCount > 1 ? 's have' : ' has'} been inactive for 7+ days.`,
    });
  }
  if (noSubmitStats > 0) {
    insights.push({
      type: 'warning',
      message: `${noSubmitStats} student${noSubmitStats > 1 ? 's have' : ' has'} no active LeetCode streak.`,
    });
  }
  if (insights.length === 0) {
    insights.push({ type: 'info', message: 'All students are on track. Great job!' });
  }

  res.json({ success: true, data: insights });
});

export const getImmersionExam = asyncHandler(async (req, res) => {
  const latest = await ImmersionExam.findOne({ isPublished: true }).sort({ week: -1 });
  if (!latest) throw new ApiError(404, 'No published immersion exam found');

  const weeklyTrend = await ImmersionExam.find({ isPublished: true })
    .sort({ week: 1 })
    .limit(6)
    .select('week avgScore topic');

  res.json({
    success: true,
    data: {
      exam: latest,
      weeklyTrend: weeklyTrend.map((e) => ({ week: `Wk ${e.week}`, avgScore: e.avgScore, topic: e.topic })),
    },
  });
});

export const getImmersionResults = asyncHandler(async (req, res) => {
  const week = parseInt(req.params.week);
  const results = await ImmersionResult.find({ week })
    .sort({ marks: -1 })
    .populate('userId', 'name avatarUrl branch');

  const rows = results.map((r, i) => {
    const u = r.userId ?? {};
    return {
      _id:      r._id,
      name:     u.name,
      avatarUrl:u.avatarUrl,
      branch:   u.branch,
      marks:    r.marks,
      status:   r.status,
      grade:    r.grade,
      weakArea: r.weakArea,
      rank:     i + 1,
    };
  });

  res.json({ success: true, data: rows });
});

export const createImmersionExam = asyncHandler(async (req, res) => {
  const { week, topic, date, duration } = req.body;
  if (!week || !topic) throw new ApiError(400, 'week and topic are required');

  const exam = await ImmersionExam.create({
    week,
    topic,
    title: topic,
    date,
    duration,
    totalStudents: await User.countDocuments({ role: 'student' }),
  });

  res.status(201).json({ success: true, data: exam });
});

export const uploadImmersionResults = asyncHandler(async (req, res) => {
  const week = parseInt(req.params.week);
  const { results } = req.body;
  if (!Array.isArray(results) || results.length === 0) {
    throw new ApiError(400, 'results array is required');
  }

  let inserted = 0, updated = 0;

  for (const { userId, marks } of results) {
    const status  = marks >= 40 ? 'Pass' : 'Fail';
    const grade   = marks >= 75 ? 'Good' : marks >= 50 ? 'Average' : 'Poor';
    const weakArea = marks < 75 ? 'Review exam topic areas' : null;

    const result = await ImmersionResult.findOneAndUpdate(
      { userId, week },
      { $set: { marks, status, grade, weakArea } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    result.isNew ? inserted++ : updated++;
  }

  const allResults = await ImmersionResult.find({ week }).sort({ marks: -1 });
  const rankedIds  = allResults.map((r) => r._id);

  await Promise.all(
    allResults.map((r, i) =>
      ImmersionResult.updateOne({ _id: r._id }, { rank: i + 1 })
    )
  );

  const scores = allResults.map((r) => r.marks);
  const passed = scores.filter((s) => s >= 40).length;
  const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;

  const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
  const scoreDistribution = ranges.map((range) => {
    const [lo, hi] = range.split('-').map(Number);
    return { range, count: scores.filter((s) => s >= lo && s <= hi).length };
  });

  const topScorers = await ImmersionResult.find({ week })
    .sort({ marks: -1 })
    .limit(3)
    .populate('userId', 'name avatarUrl');

  await ImmersionExam.findOneAndUpdate(
    { week },
    {
      appeared:     allResults.length,
      passed,
      avgScore:     Math.round(avg * 10) / 10,
      highestScore: Math.max(...scores),
      lowestScore:  Math.min(...scores),
      passPercent:  Math.round((passed / allResults.length) * 100),
      scoreDistribution,
      topScorers: topScorers.map((r, i) => ({
        userId:    r.userId._id,
        name:      r.userId.name,
        avatarUrl: r.userId.avatarUrl,
        score:     r.marks,
        rank:      i + 1,
      })),
      isPublished: true,
    }
  );

  res.json({ success: true, data: { inserted, updated } });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const [overviewData, trend, topPerformers, atRisk, insights, latestExam] = await Promise.all([
    (async () => {
      const [total, active] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'student', lastActive: { $gte: TWO_DAYS_AGO() } }),
      ]);
      return { total, active };
    })(),
    (async () => {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return labels.map((d) => ({ date: d, totalActivity: 0, avgProblems: 0 }));
    })(),
    CodingStat.aggregate([
      { $sort: { leetcodeScore: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: '$user._id', name: '$user.name', avatarUrl: '$user.avatarUrl', leetcodeScore: 1 } },
    ]),
    CodingStat.find({
      $or: [
        { leetcodeScore: { $lt: AT_RISK_SCORE } },
        { 'leetcode.currentStreak': 0 },
        { 'combined.totalSolved': { $lt: AT_RISK_SOLVED } },
      ],
    }).populate('userId', 'name avatarUrl').limit(5).lean(),
    (async () => {
      const inactive = await User.countDocuments({ role: 'student', lastActive: { $lt: SEVEN_DAYS_AGO() } });
      return inactive > 0
        ? [{ type: 'alert', message: `${inactive} students inactive for 7+ days` }]
        : [{ type: 'info', message: 'All students on track!' }];
    })(),
    ImmersionExam.findOne({ isPublished: true }).sort({ week: -1 }),
  ]);

  const latestWeek = latestExam?.week;
  const examResults = latestWeek
    ? await ImmersionResult.find({ week: latestWeek })
        .sort({ marks: -1 })
        .populate('userId', 'name avatarUrl branch')
    : [];

  res.json({
    success: true,
    data: {
      profile: {
        _id: req.user._id, name: req.user.name, email: req.user.email,
        role: req.user.role, avatarUrl: req.user.avatarUrl,
      },
      overview: {
        totalStudents:   overviewData.total,
        activeStudents:  overviewData.active,
        inactiveStudents:overviewData.total - overviewData.active,
      },
      trend,
      topPerformers,
      atRisk: atRisk.filter((s) => s.userId).map((s) => ({
        _id: s.userId._id, name: s.userId.name, avatarUrl: s.userId.avatarUrl,
        score: s.leetcodeScore, isAtRisk: true,
      })),
      insights,
      immersionExam: latestExam,
      immersionExamResults: examResults.map((r, i) => ({
        _id: r._id, name: r.userId?.name, avatarUrl: r.userId?.avatarUrl,
        branch: r.userId?.branch, marks: r.marks, status: r.status,
        grade: r.grade, rank: i + 1,
      })),
    },
  });
});
