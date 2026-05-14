import LeaderboardSnapshot from '../models/LeaderboardSnapshot.js';
import ImmersionResult from '../models/ImmersionResult.js';
import ImmersionExam from '../models/ImmersionExam.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getLeaderboard = asyncHandler(async (req, res) => {
  const platform = req.query.platform ?? 'leetcode';
  const time     = req.query.time     ?? 'weekly';

  const snapshot = await LeaderboardSnapshot.findOne({ platform, period: time }).lean();
  if (!snapshot) {
    return res.json({ success: true, data: { rows: [], you: null } });
  }

  const userId = String(req.user._id);
  const rows = snapshot.entries.map((e) => ({
    _id:           e.userId,
    rank:          e.rank,
    name:          e.name,
    avatarUrl:     e.avatarUrl,
    batch:         e.batch,
    branch:        e.branch,
    leetcodeScore: e.leetcodeScore,
    githubScore:   e.githubScore,
    totalScore:    e.totalScore,
    isMe:          String(e.userId) === userId,
  }));

  const you = rows.find((r) => r.isMe) ?? null;

  res.json({ success: true, data: { rows, you } });
});

export const getImmersionLeaderboard = asyncHandler(async (req, res) => {
  const week = parseInt(req.query.week ?? 1);

  const [results, weekMeta] = await Promise.all([
    ImmersionResult.find({ week })
      .sort({ marks: -1 })
      .populate('userId', 'name avatarUrl branch')
      .lean(),
    ImmersionExam.findOne({ week }).select('topic date').lean(),
  ]);

  const userId = String(req.user._id);
  const rows = results.map((r, i) => ({
    _id:      r._id,
    name:     r.userId?.name     ?? '',
    avatarUrl:r.userId?.avatarUrl ?? '',
    branch:   r.userId?.branch   ?? '',
    marks:    r.marks,
    status:   r.status,
    grade:    r.grade,
    weakArea: r.weakArea,
    rank:     i + 1,
    isMe:     String(r.userId?._id) === userId,
  }));

  const top3  = rows.slice(0, 3);
  const me    = rows.find((r) => r.isMe) ?? null;
  const myRank = me?.rank ?? rows.length + 1;
  const low   = Math.max(0, myRank - 6);
  const high  = Math.min(rows.length, myRank + 5);
  const around = rows.slice(low, high);

  res.json({
    success: true,
    data: {
      top3, around, me,
      total: rows.length,
      weekMeta: weekMeta ?? { topic: `Week ${week}`, date: null },
    },
  });
});
