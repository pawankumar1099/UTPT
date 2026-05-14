import User from '../models/User.js';
import CodingStat from '../models/CodingStat.js';
import GithubStat from '../models/GithubStat.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import LeaderboardSnapshot from '../models/LeaderboardSnapshot.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

function flatToGrid(flat, rows, cols) {
  if (!flat || flat.length === 0) return Array.from({ length: rows }, () => Array(cols).fill(0));
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(flat.slice(r * cols, r * cols + cols));
  }
  return grid;
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d >= 1) return `${d} day${d > 1 ? 's' : ''} ago`;
  return `${h || 1} hour${h !== 1 ? 's' : ''} ago`;
}

function motivationalMsg(commits, streak) {
  if (streak >= 14) return 'Outstanding! Your consistency is paying off. Keep up the incredible streak!';
  if (streak >= 7) return 'Great work! You are on a solid streak. Keep contributing and building amazing projects.';
  if (commits >= 100) return 'You are a prolific contributor. Keep coding and pushing your boundaries!';
  return 'Keep up the great work! Every commit counts. Stay consistent and keep growing!';
}

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [cs, gs, activity, snapshot, notifications] = await Promise.all([
    CodingStat.findOne({ userId }).lean(),
    GithubStat.findOne({ userId }).lean(),
    ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    LeaderboardSnapshot.findOne({ platform: 'combined', period: 'weekly' }).lean(),
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  const user = req.user;

  const totalSolved = cs?.combined?.totalSolved ?? 0;
  const easy   = cs?.combined?.easy   ?? { solved: 0, total: 800, percentage: 0 };
  const medium = cs?.combined?.medium ?? { solved: 0, total: 1500, percentage: 0 };
  const hard   = cs?.combined?.hard   ?? { solved: 0, total: 700, percentage: 0 };

  const myEntry = snapshot?.entries?.find((e) => String(e.userId) === String(userId));
  const top3 = (snapshot?.entries ?? []).slice(0, 3).map((e) => ({
    _id: e.userId, rank: e.rank, name: e.name, score: e.totalScore, avatarUrl: e.avatarUrl,
  }));

  const heatmapFlat = gs?.contributionHeatmap ?? [];
  const heatmap7x26 = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 26 }, (_, c) => {
      const idx = (r % 3) * 30 + Math.min(c, 29);
      return heatmapFlat[idx] ?? 0;
    })
  );

  const recentRepos = (gs?.topRepositories ?? []).slice(0, 3).map((r) => ({
    _id: r.repoId || r.name, name: r.name, status: r.status, updatedAt: r.updatedAt,
  }));

  res.json({
    success: true,
    data: {
      profile: {
        _id: user._id, name: user.name, email: user.email, role: user.role,
        avatarUrl: user.avatarUrl || gs?.topRepositories?.[0]?.name || '',
        batch: user.batch, branch: user.branch, specialization: user.specialization,
        joinedAt: user.joinedAt,
      },
      stats: {
        totalSolved,
        easy, medium, hard,
        currentStreak: cs?.leetcode?.currentStreak ?? 0,
        longestStreak: cs?.leetcode?.longestStreak ?? 0,
        totalCommits:  gs?.totalCommits ?? 0,
        rank: myEntry?.rank ?? null,
        ranking: { batch: myEntry?.rank ?? null, branch: null, specialization: null },
      },
      problemsTimeline: (cs?.problemsOverTime ?? []).map((p) => ({ date: p.date, solved: p.total ?? 0 })),
      github: {
        totalCommits: gs?.totalCommits ?? 0,
        repositories: gs?.repositories ?? 0,
        status: gs?.status ?? 'Inactive',
        username: user.githubUsername || '',
        heatmap: heatmap7x26,
        months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
        recentRepos,
      },
      activity: activity.map((a) => ({ _id: a._id, type: a.type, text: a.text, createdAt: a.createdAt })),
      leaderboard: {
        top: top3,
        you: myEntry
          ? { _id: myEntry.userId, rank: myEntry.rank, name: myEntry.name, score: myEntry.totalScore }
          : { _id: user._id, rank: null, name: user.name, score: 0 },
      },
      notifications: notifications.map((n) => ({
        _id: n._id, type: n.type, title: n.title, message: n.message, read: n.read, createdAt: n.createdAt,
      })),
    },
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      _id: user._id, name: user.name, email: user.email, role: user.role,
      avatarUrl: user.avatarUrl, batch: user.batch, branch: user.branch,
      specialization: user.specialization, joinedAt: user.joinedAt,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatarUrl', 'leetcodeUsername', 'githubUsername', 'codeforcesUsername'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-passwordHash');
  res.json({ success: true, data: user });
});

export const getCodingStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [cs, gs, snapshot] = await Promise.all([
    CodingStat.findOne({ userId }).lean(),
    GithubStat.findOne({ userId }).lean(),
    LeaderboardSnapshot.findOne({ platform: 'combined', period: 'weekly' }).lean(),
  ]);

  const myEntry = snapshot?.entries?.find((e) => String(e.userId) === String(userId));

  res.json({
    success: true,
    data: {
      totalSolved:   cs?.combined?.totalSolved ?? 0,
      easy:          cs?.combined?.easy   ?? { solved: 0, total: 800, percentage: 0 },
      medium:        cs?.combined?.medium ?? { solved: 0, total: 1500, percentage: 0 },
      hard:          cs?.combined?.hard   ?? { solved: 0, total: 700, percentage: 0 },
      currentStreak: cs?.leetcode?.currentStreak ?? 0,
      longestStreak: cs?.leetcode?.longestStreak ?? 0,
      totalCommits:  gs?.totalCommits ?? 0,
      rank: myEntry?.rank ?? null,
      ranking: { batch: myEntry?.rank ?? null, branch: null, specialization: null },
    },
  });
});

export const getCodingProgress = asyncHandler(async (req, res) => {
  const platform = req.query.platform ?? 'all';
  const userId = req.user._id;
  const cs = await CodingStat.findOne({ userId }).lean();
  if (!cs) throw new ApiError(404, 'No coding stats found. Sync has not run yet.');

  let stats, calFlat, recentSubs, streak, longestStreak, longestStreakRange;

  if (platform === 'leetcode') {
    const lc = cs.leetcode ?? {};
    stats = {
      totalSolved: lc.totalSolved ?? 0,
      easy:   lc.easy   ?? { solved: 0, total: 400, percentage: 0 },
      medium: lc.medium ?? { solved: 0, total: 450, percentage: 0 },
      hard:   lc.hard   ?? { solved: 0, total: 200, percentage: 0 },
      globalRanking: lc.globalRanking ?? 0, globalRankingChange: 0,
      acceptanceRate: lc.acceptanceRate ?? 0,
      totalSubmissions: lc.totalSubmissions ?? 0,
      contestsParticipated: lc.contestsParticipated ?? 0,
      contestRating: lc.contestRating ?? 0,
    };
    calFlat = cs.submissionCalendar?.leetcode ?? [];
    recentSubs = lc.recentSubmissions ?? [];
    streak = lc.currentStreak ?? 0;
    longestStreak = lc.longestStreak ?? 0;
    longestStreakRange = lc.longestStreakRange ?? '';
  } else if (platform === 'codeforces') {
    const cf = cs.codeforces ?? {};
    stats = {
      totalSolved: cf.totalSolved ?? 0,
      easy:   cf.easy   ?? { solved: 0, total: 200, percentage: 0 },
      medium: cf.medium ?? { solved: 0, total: 150, percentage: 0 },
      hard:   cf.hard   ?? { solved: 0, total: 100, percentage: 0 },
      globalRanking: cf.globalRanking ?? 0, globalRankingChange: 0,
      acceptanceRate: cf.acceptanceRate ?? 0,
      totalSubmissions: cf.totalSubmissions ?? 0,
      contestsParticipated: cf.contestsParticipated ?? 0,
      contestRating: cf.contestRating ?? 0,
    };
    calFlat = cs.submissionCalendar?.codeforces ?? [];
    recentSubs = cf.recentSubmissions ?? [];
    streak = cf.currentStreak ?? 0;
    longestStreak = cf.longestStreak ?? 0;
    longestStreakRange = cf.longestStreakRange ?? '';
  } else {
    const cb = cs.combined ?? {};
    stats = {
      totalSolved: cb.totalSolved ?? 0,
      easy:   cb.easy   ?? { solved: 0, total: 800, percentage: 0 },
      medium: cb.medium ?? { solved: 0, total: 1500, percentage: 0 },
      hard:   cb.hard   ?? { solved: 0, total: 700, percentage: 0 },
      globalRanking: cs.leetcode?.globalRanking ?? 0, globalRankingChange: 0,
      acceptanceRate: cb.acceptanceRate ?? 0,
      totalSubmissions: cb.totalSubmissions ?? 0,
      contestsParticipated: cb.contestsParticipated ?? 0,
      contestRating: cs.leetcode?.contestRating ?? 0,
    };
    calFlat = cs.submissionCalendar?.combined ?? [];
    recentSubs = cb.recentSubmissions ?? [];
    streak = cs.leetcode?.currentStreak ?? 0;
    longestStreak = cs.leetcode?.longestStreak ?? 0;
    longestStreakRange = cs.leetcode?.longestStreakRange ?? '';
  }

  const ROWS = 5, COLS = 20;
  const submissionCalendar = flatToGrid(calFlat, ROWS, COLS);

  const overTime = cs.problemsOverTime ?? [];
  const easyPct   = stats.totalSolved > 0 ? (stats.easy?.solved   ?? 0) / stats.totalSolved : 0;
  const medPct    = stats.totalSolved > 0 ? (stats.medium?.solved  ?? 0) / stats.totalSolved : 0;
  const hardPct   = stats.totalSolved > 0 ? (stats.hard?.solved    ?? 0) / stats.totalSolved : 0;

  const problemsOverTime = overTime.map((p) => ({
    date: p.date,
    easy:   Math.round((p.total ?? 0) * easyPct),
    medium: Math.round((p.total ?? 0) * medPct),
    hard:   Math.round((p.total ?? 0) * hardPct),
    total:  p.total ?? 0,
  }));

  res.json({
    success: true,
    data: {
      stats,
      currentStreak: streak, longestStreak, longestStreakRange,
      problemsOverTime,
      calendarMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      calendarDays: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
      submissionCalendar,
      recentSubmissions: recentSubs.slice(0, 5).map((s, i) => ({
        _id: `s${i}`, problem: s.problem, difficulty: s.difficulty,
        status: s.status, language: s.language, submittedAt: s.submittedAt,
      })),
    },
  });
});

export const getGithubActivity = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const gs = await GithubStat.findOne({ userId }).lean();
  if (!gs) throw new ApiError(404, 'No GitHub stats found. Sync has not run yet.');

  const heatmap = flatToGrid(gs.contributionHeatmap ?? [], 3, 30);

  res.json({
    success: true,
    data: {
      totalCommits: gs.totalCommits ?? 0,
      totalCommitsChange: gs.totalCommitsChange ?? 0,
      pullRequests: gs.pullRequests ?? 0,
      pullRequestsChange: gs.pullRequestsChange ?? 0,
      repositories: gs.repositories ?? 0,
      contributionHeatmap: heatmap,
      calendarDays: gs.calendarDays ?? ['Mon', 'Wed', 'Fri'],
      weekLabels: gs.weekLabels ?? [],
      commitsOverTime: gs.commitsOverTime ?? [],
      topRepositories: (gs.topRepositories ?? []).map((r) => ({
        _id: r.repoId || r.name, name: r.name, commits: r.commits ?? 0,
        language: r.language, updatedAt: r.updatedAt, status: r.status,
      })),
      recentEvents: (gs.recentEvents ?? []).map((e, i) => ({
        _id: `e${i}`, type: e.type, repo: e.repo, message: e.message,
        branch: e.branch, ago: e.ago || timeAgo(e.occurredAt),
      })),
      motivationalMsg: motivationalMsg(gs.totalCommits ?? 0, 0),
    },
  });
});

export const getActivity = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find({ userId: req.user._id })
    .sort({ createdAt: -1 }).limit(10).lean();
  res.json({
    success: true,
    data: logs.map((a) => ({ _id: a._id, type: a.type, text: a.text, createdAt: a.createdAt })),
  });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const query = { userId: req.user._id };
  if (req.query.unread === 'true') query.read = false;
  const notes = await Notification.find(query).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ success: true, data: notes });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { read: true } }
  );
  res.json({ success: true, message: 'Marked as read' });
});
