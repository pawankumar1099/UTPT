import CodingStat from '../models/CodingStat.js';
import GithubStat from '../models/GithubStat.js';
import LeaderboardSnapshot from '../models/LeaderboardSnapshot.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  const { _id, name, email, role, batch, branch, specialization, avatarUrl, joinedAt,
          leetcodeUsername, codeforcesUsername, githubUsername } = req.user;
  res.json({ success: true, data: {
    _id, name, email, role, batch, branch, specialization, avatarUrl, joinedAt,
    leetcodeUsername, codeforcesUsername, githubUsername,
  }});
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatarUrl', 'leetcodeUsername', 'codeforcesUsername', 'githubUsername', 'batch', 'branch', 'specialization'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await req.user.constructor.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
  res.json({ success: true, data: user });
});

export const getCodingStats = asyncHandler(async (req, res) => {
  const stat = await CodingStat.findOne({ userId: req.user._id });
  if (!stat) throw new ApiError(404, 'Coding stats not found — sync not yet run');

  const rank = await CodingStat.countDocuments({ leetcodeScore: { $gt: stat.leetcodeScore } }) + 1;

  const snapshot = await LeaderboardSnapshot.findOne({ platform: 'leetcode', period: 'weekly' });
  const batchRank = snapshot?.entries
    .filter((e) => e.batch === req.user.batch)
    .sort((a, b) => b.leetcodeScore - a.leetcodeScore)
    .findIndex((e) => String(e.userId) === String(req.user._id));
  const branchRank = snapshot?.entries
    .filter((e) => e.branch === req.user.branch)
    .sort((a, b) => b.leetcodeScore - a.leetcodeScore)
    .findIndex((e) => String(e.userId) === String(req.user._id));

  const githubStat = await GithubStat.findOne({ userId: req.user._id });

  res.json({
    success: true,
    data: {
      totalSolved:   stat.combined?.totalSolved ?? stat.leetcode?.totalSolved ?? 0,
      easy:          stat.combined?.easy   ?? stat.leetcode?.easy,
      medium:        stat.combined?.medium ?? stat.leetcode?.medium,
      hard:          stat.combined?.hard   ?? stat.leetcode?.hard,
      currentStreak: stat.leetcode?.currentStreak ?? 0,
      longestStreak: stat.leetcode?.longestStreak ?? 0,
      totalCommits:  githubStat?.totalCommits ?? 0,
      rank,
      ranking: {
        batch:          batchRank !== undefined && batchRank >= 0 ? batchRank + 1 : null,
        branch:         branchRank !== undefined && branchRank >= 0 ? branchRank + 1 : null,
        specialization: null,
      },
    },
  });
});

export const getCodingProgress = asyncHandler(async (req, res) => {
  const platform = req.query.platform ?? 'all';
  const stat = await CodingStat.findOne({ userId: req.user._id });
  if (!stat) throw new ApiError(404, 'Coding stats not found');

  const src = platform === 'leetcode' ? stat.leetcode
            : platform === 'codeforces' ? stat.codeforces
            : stat.combined;

  res.json({
    success: true,
    data: {
      stats: {
        totalSolved:          src?.totalSolved ?? 0,
        easy:                 src?.easy,
        medium:               src?.medium,
        hard:                 src?.hard,
        globalRanking:        src?.globalRanking,
        globalRankingChange:  src?.globalRankingChange,
        acceptanceRate:       src?.acceptanceRate,
        totalSubmissions:     src?.totalSubmissions,
        contestsParticipated: src?.contestsParticipated,
        contestRating:        src?.contestRating,
      },
      currentStreak:      stat.leetcode?.currentStreak ?? 0,
      longestStreak:      stat.leetcode?.longestStreak ?? 0,
      longestStreakRange:  stat.leetcode?.longestStreakRange ?? null,
      problemsOverTime:   stat.problemsOverTime ?? [],
      submissionCalendar: stat.submissionCalendar?.[platform === 'all' ? 'combined' : platform] ?? [],
      recentSubmissions:  (src?.recentSubmissions ?? []).slice(0, 5),
    },
  });
});

export const getGithubActivity = asyncHandler(async (req, res) => {
  const stat = await GithubStat.findOne({ userId: req.user._id });
  if (!stat) throw new ApiError(404, 'GitHub stats not found — sync not yet run');

  const motivationalMsgs = [
    'Keep up the great work! Every commit counts.',
    'Consistency is key. You\'re doing great!',
    'Your code is making a difference. Keep it up!',
  ];
  const motivationalMsg = motivationalMsgs[Math.floor(Math.random() * motivationalMsgs.length)];

  res.json({
    success: true,
    data: {
      totalCommits:        stat.totalCommits,
      totalCommitsChange:  stat.totalCommitsChange,
      pullRequests:        stat.pullRequests,
      pullRequestsChange:  stat.pullRequestsChange,
      repositories:        stat.repositories,
      status:              stat.status,
      contributionHeatmap: stat.contributionHeatmap,
      calendarDays:        stat.calendarDays,
      weekLabels:          stat.weekLabels,
      commitsOverTime:     stat.commitsOverTime,
      topRepositories:     stat.topRepositories,
      recentEvents:        stat.recentEvents,
      motivationalMsg,
    },
  });
});

export const getActivity = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ success: true, data: logs });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const query = { userId: req.user._id };
  if (req.query.unread === 'true') query.read = false;
  const notes = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: notes });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const note = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );
  if (!note) throw new ApiError(404, 'Notification not found');
  res.json({ success: true, data: note });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [stat, githubStat, activity, snapshot, notifications] = await Promise.all([
    CodingStat.findOne({ userId }),
    GithubStat.findOne({ userId }),
    ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(10),
    LeaderboardSnapshot.findOne({ platform: 'combined', period: 'weekly' }),
    Notification.find({ userId, read: false }).sort({ createdAt: -1 }).limit(5),
  ]);

  const myEntry = snapshot?.entries.find((e) => String(e.userId) === String(userId));
  const top3    = snapshot?.entries.slice(0, 3) ?? [];

  const { _id, name, email, role, batch, branch, specialization, avatarUrl, joinedAt } = req.user;

  res.json({
    success: true,
    data: {
      profile:  { _id, name, email, role, batch, branch, specialization, avatarUrl, joinedAt },
      stats: {
        totalSolved:   stat?.combined?.totalSolved ?? stat?.leetcode?.totalSolved ?? 0,
        easy:          stat?.combined?.easy   ?? stat?.leetcode?.easy,
        medium:        stat?.combined?.medium ?? stat?.leetcode?.medium,
        hard:          stat?.combined?.hard   ?? stat?.leetcode?.hard,
        currentStreak: stat?.leetcode?.currentStreak ?? 0,
        longestStreak: stat?.leetcode?.longestStreak ?? 0,
        totalCommits:  githubStat?.totalCommits ?? 0,
      },
      activity,
      github: {
        totalCommits: githubStat?.totalCommits ?? 0,
        repositories: githubStat?.repositories ?? 0,
        status:       githubStat?.status ?? 'Inactive',
        pullRequests: githubStat?.pullRequests ?? 0,
      },
      leaderboard: { top: top3, you: myEntry ?? null },
      notifications,
    },
  });
});
