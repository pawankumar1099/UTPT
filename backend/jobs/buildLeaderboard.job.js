import cron from 'node-cron';
import CodingStat from '../models/CodingStat.js';
import GithubStat from '../models/GithubStat.js';
import User from '../models/User.js';
import LeaderboardSnapshot from '../models/LeaderboardSnapshot.js';
import { computeTotalScore } from '../services/score.service.js';

async function buildSnapshot(platform, period) {
  const now   = new Date();
  const start = new Date(now);
  if (period === 'weekly')  start.setDate(start.getDate() - 7);
  if (period === 'monthly') start.setMonth(start.getMonth() - 1);

  const [codingStats, githubStats, users] = await Promise.all([
    CodingStat.find({}).lean(),
    GithubStat.find({}).lean(),
    User.find({ role: 'student' }).lean(),
  ]);

  const userMap   = Object.fromEntries(users.map((u) => [String(u._id), u]));
  const githubMap = Object.fromEntries(githubStats.map((g) => [String(g.userId), g]));

  const scored = codingStats
    .map((cs) => {
      const uid  = String(cs.userId);
      const user = userMap[uid];
      if (!user) return null;
      const gs   = githubMap[uid];
      const lcScore = cs.leetcodeScore  ?? 0;
      const ghScore = gs?.githubScore   ?? 0;
      const total   = computeTotalScore(lcScore, ghScore);

      const score = platform === 'leetcode' ? lcScore
                  : platform === 'github'   ? ghScore
                  : total;

      return {
        userId:        cs.userId,
        name:          user.name,
        avatarUrl:     user.avatarUrl ?? '',
        batch:         user.batch,
        branch:        user.branch,
        leetcodeScore: lcScore,
        githubScore:   ghScore,
        totalScore:    total,
        _score:        score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b._score - a._score)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  await LeaderboardSnapshot.findOneAndUpdate(
    { platform, period },
    { $set: { platform, period, periodStart: start, periodEnd: now, entries: scored, builtAt: now } },
    { upsert: true }
  );

  console.log(`[leaderboard] Built ${platform}/${period} — ${scored.length} entries`);
}

export function scheduleLeaderboardBuild(schedule) {
  cron.schedule(schedule, async () => {
    console.log('[cron] Building leaderboard snapshots...');
    const platforms = ['leetcode', 'github', 'combined'];
    const periods   = ['weekly', 'monthly'];
    for (const platform of platforms) {
      for (const period of periods) {
        await buildSnapshot(platform, period);
      }
    }
    console.log('[cron] Leaderboard build complete');
  });
}

export { buildSnapshot };
