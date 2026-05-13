import User from '../models/User.js';
import CodingStat from '../models/CodingStat.js';
import ActivityLog from '../models/ActivityLog.js';
import { fetchFullLeetCodeData } from '../services/leetcode.service.js';
import { fetchFullCodeforcesData } from '../services/codeforces.service.js';
import {
  computeLeetcodeScore,
  computeCodeforcesScore,
  buildCombinedStats,
  buildCombinedCalendar,
  buildCombinedProblemsOverTime,
} from '../services/score.service.js';

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export async function syncCodingStatsForUser(user) {
  const [lcData, cfData] = await Promise.allSettled([
    user.leetcodeUsername   ? fetchFullLeetCodeData(user.leetcodeUsername)   : Promise.resolve(null),
    user.codeforcesUsername ? fetchFullCodeforcesData(user.codeforcesUsername) : Promise.resolve(null),
  ]);

  const lc = lcData.status === 'fulfilled' ? lcData.value : null;
  const cf = cfData.status === 'fulfilled' ? cfData.value : null;

  if (!lc && !cf) {
    console.log(`  [skip] ${user.name} — no platform usernames configured`);
    return;
  }

  const lcScore = computeLeetcodeScore(lc);
  const cfScore = computeCodeforcesScore(cf);
  const combined = buildCombinedStats(lc, cf);

  const lcCalendar = lc?.submissionCalendar ?? [];
  const cfCalendar = cf?.submissionCalendar ?? [];

  const existing = await CodingStat.findOne({ userId: user._id });
  const prevTotalSolved = existing?.combined?.totalSolved ?? 0;
  const prevStreak      = existing?.leetcode?.currentStreak ?? 0;

  const update = {
    userId:   user._id,
    lastSyncedAt: new Date(),
    leetcodeScore:   lcScore,
    codeforcesScore: cfScore,
    combined,
    submissionCalendar: {
      leetcode:   lcCalendar,
      codeforces: cfCalendar,
      combined:   buildCombinedCalendar(lcCalendar, cfCalendar),
    },
    problemsOverTime: buildCombinedProblemsOverTime(
      lc?.problemsOverTime ?? [],
      cf?.problemsOverTime ?? []
    ),
  };

  if (lc) {
    update.leetcode = {
      totalSolved:          lc.totalSolved,
      easy:                 lc.easy,
      medium:               lc.medium,
      hard:                 lc.hard,
      globalRanking:        lc.globalRanking,
      acceptanceRate:       lc.acceptanceRate,
      totalSubmissions:     lc.totalSubmissions,
      contestsParticipated: lc.contestsParticipated,
      contestRating:        lc.contestRating,
      currentStreak:        lc.currentStreak,
      longestStreak:        lc.longestStreak,
      longestStreakRange:   lc.longestStreakRange,
      recentSubmissions:    lc.recentSubmissions,
    };
  }

  if (cf) {
    update.codeforces = {
      totalSolved:          cf.totalSolved,
      easy:                 cf.easy,
      medium:               cf.medium,
      hard:                 cf.hard,
      globalRanking:        cf.globalRanking,
      acceptanceRate:       cf.acceptanceRate,
      totalSubmissions:     cf.totalSubmissions,
      contestsParticipated: cf.contestsParticipated,
      contestRating:        cf.contestRating,
      currentStreak:        cf.currentStreak,
      longestStreak:        cf.longestStreak,
      recentSubmissions:    cf.recentSubmissions,
    };
  }

  await CodingStat.findOneAndUpdate(
    { userId: user._id },
    { $set: update },
    { upsert: true, new: true }
  );

  const newTotalSolved = combined?.totalSolved ?? 0;
  const newStreak      = lc?.currentStreak ?? 0;
  const activityLogs   = [];

  if (newTotalSolved > prevTotalSolved) {
    const diff = newTotalSolved - prevTotalSolved;
    activityLogs.push({ userId: user._id, type: 'solve', text: `Solved ${diff} new problem${diff > 1 ? 's' : ''} on coding platforms` });
  }
  if (newStreak > 0 && newStreak !== prevStreak) {
    activityLogs.push({ userId: user._id, type: 'streak', text: `Maintained ${newStreak} day streak on LeetCode` });
  }

  if (activityLogs.length > 0) {
    await ActivityLog.insertMany(activityLogs);
  }

  console.log(`  [ok] ${user.name} — LC:${lc?.totalSolved ?? '-'} CF:${cf?.totalSolved ?? '-'} score:${lcScore + cfScore}`);
}

export async function syncAllCodingStats() {
  console.log('\n[CodingSync] Starting...');
  const users = await User.find({ role: 'student' });
  console.log(`[CodingSync] Found ${users.length} students`);

  let success = 0;
  let failed  = 0;

  for (const user of users) {
    try {
      await syncCodingStatsForUser(user);
      success++;
    } catch (err) {
      console.error(`  [err] ${user.name}: ${err.message}`);
      failed++;
    }
    await delay(1500);
  }

  console.log(`[CodingSync] Done — ${success} success, ${failed} failed\n`);
}
