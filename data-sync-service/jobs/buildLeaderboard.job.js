import User from '../models/User.js';
import CodingStat from '../models/CodingStat.js';
import GithubStat from '../models/GithubStat.js';
import LeaderboardSnapshot from '../models/LeaderboardSnapshot.js';
import ActivityLog from '../models/ActivityLog.js';

export async function buildLeaderboardSnapshots() {
  console.log('\n[Leaderboard] Building snapshots...');

  const [users, codingStats, githubStats] = await Promise.all([
    User.find({ role: 'student' }).lean(),
    CodingStat.find({}).lean(),
    GithubStat.find({}).lean(),
  ]);

  const codingMap = new Map(codingStats.map(s => [String(s.userId), s]));
  const githubMap = new Map(githubStats.map(s => [String(s.userId), s]));

  const userEntries = users.map(u => {
    const cs = codingMap.get(String(u._id));
    const gh = githubMap.get(String(u._id));

    const leetcodeScore  = cs?.leetcodeScore  ?? 0;
    const githubScore    = gh?.githubScore    ?? 0;
    const totalScore     = leetcodeScore + githubScore;

    return {
      userId:        u._id,
      name:          u.name,
      avatarUrl:     u.avatarUrl ?? gh?.topRepositories?.[0]?.name ?? '',
      batch:         u.batch ?? '',
      branch:        u.branch ?? '',
      leetcodeScore,
      githubScore,
      totalScore,
    };
  });

  const now = new Date();
  const weekStart  = new Date(now.getTime() - 7  * 86400000);
  const monthStart = new Date(now.getTime() - 30 * 86400000);

  const platforms = [
    {
      platform: 'leetcode',
      sortKey:  'leetcodeScore',
    },
    {
      platform: 'github',
      sortKey:  'githubScore',
    },
    {
      platform: 'combined',
      sortKey:  'totalScore',
    },
  ];

  const periods = [
    { period: 'weekly',  start: weekStart,  end: now },
    { period: 'monthly', start: monthStart, end: now },
  ];

  const snapshots = [];
  for (const { platform, sortKey } of platforms) {
    for (const { period, start, end } of periods) {
      const sorted = [...userEntries]
        .sort((a, b) => b[sortKey] - a[sortKey]);

      const entries = sorted.map((e, i) => ({ ...e, rank: i + 1 }));

      snapshots.push({
        platform,
        period,
        periodStart: start,
        periodEnd:   end,
        entries,
        builtAt:     now,
      });
    }
  }

  for (const snap of snapshots) {
    await LeaderboardSnapshot.findOneAndUpdate(
      { platform: snap.platform, period: snap.period },
      { $set: snap },
      { upsert: true, new: true }
    );
    console.log(`  [ok] ${snap.platform}/${snap.period} — ${snap.entries.length} entries`);
  }

  await generateRankChangeActivityLogs(userEntries, codingMap);

  console.log('[Leaderboard] Snapshots built\n');
}

async function generateRankChangeActivityLogs(entries, codingMap) {
  const sorted = [...entries].sort((a, b) => b.totalScore - a.totalScore);
  const logs   = [];

  for (let i = 0; i < sorted.length; i++) {
    const e  = sorted[i];
    const cs = codingMap.get(String(e.userId));
    if (!cs) continue;

    const rank = i + 1;
    if (rank <= 10) {
      const recentLog = await ActivityLog.findOne({
        userId: e.userId,
        type:   'rank',
        createdAt: { $gte: new Date(Date.now() - 24 * 3600000) },
      });
      if (!recentLog) {
        logs.push({ userId: e.userId, type: 'rank', text: `Currently ranked #${rank} on the leaderboard` });
      }
    }
  }

  if (logs.length > 0) {
    await ActivityLog.insertMany(logs);
  }
}
