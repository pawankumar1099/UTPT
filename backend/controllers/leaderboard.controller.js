import LeaderboardSnapshot from '../models/LeaderboardSnapshot.js';
import ImmersionResult from '../models/ImmersionResult.js';
import ImmersionExam from '../models/ImmersionExam.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getLeaderboard = asyncHandler(async (req, res) => {
  const platform = req.query.platform ?? 'leetcode';
  const period   = req.query.time     ?? 'weekly';

  const snapshot = await LeaderboardSnapshot.findOne({ platform, period });
  if (!snapshot) throw new ApiError(404, 'Leaderboard snapshot not yet built — run the cron job');

  const userId = String(req.user._id);
  const rows = snapshot.entries.map((e) => ({
    ...e.toObject(),
    isMe: String(e.userId) === userId,
  }));

  const me = rows.find((r) => r.isMe) ?? null;

  res.json({ success: true, data: { rows, you: me } });
});

export const getImmersionLeaderboard = asyncHandler(async (req, res) => {
  const week = parseInt(req.query.week ?? 1);

  const [results, weekMeta] = await Promise.all([
    ImmersionResult.find({ week })
      .sort({ marks: -1 })
      .populate('userId', 'name avatarUrl branch'),
    ImmersionExam.findOne({ week }).select('topic date title'),
  ]);

  const userId = String(req.user._id);
  const ranked = results.map((r, i) => {
    const obj = r.toObject();
    const user = obj.userId ?? {};
    return {
      _id:      obj._id,
      name:     user.name,
      avatarUrl:user.avatarUrl,
      branch:   user.branch,
      marks:    obj.marks,
      status:   obj.status,
      grade:    obj.grade,
      weakArea: obj.weakArea,
      rank:     i + 1,
      isMe:     String(r.userId?._id) === userId,
    };
  });

  const me     = ranked.find((r) => r.isMe) ?? null;
  const myRank = me?.rank ?? 0;
  const top3   = ranked.slice(0, 3);
  const low    = Math.max(0, myRank - 6);
  const high   = Math.min(ranked.length, myRank + 5);
  const around = ranked.slice(low, high);

  res.json({
    success: true,
    data: { top3, around, me, total: ranked.length, weekMeta },
  });
});
