import cron from 'node-cron';
import User from '../models/User.js';
import CodingStat from '../models/CodingStat.js';
import ActivityLog from '../models/ActivityLog.js';
import {
  fetchLeetCodeStats,
  fetchRecentSubmissions,
  fetchContestHistory,
  deriveStreakFromCalendar,
  buildSubmissionCalendar,
} from '../services/leetcode.service.js';
import {
  fetchSubmissions as fetchCFSubmissions,
  fetchContestHistory as fetchCFContestHistory,
  fetchUserInfo as fetchCFUserInfo,
  computeCodeforcesStats,
} from '../services/codeforces.service.js';
import { computeLeetcodeScore } from '../services/score.service.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function syncUser(user) {
  try {
    const update = { userId: user._id, lastSyncedAt: new Date() };

    if (user.leetcodeUsername) {
      try {
        const [lcData, recentSubs, contestData] = await Promise.all([
          fetchLeetCodeStats(user.leetcodeUsername),
          fetchRecentSubmissions(user.leetcodeUsername, 10),
          fetchContestHistory(user.leetcodeUsername),
        ]);

        const matched = lcData?.matchedUser;
        const allQ    = lcData?.allQuestionsCount ?? [];
        const acNums  = matched?.submitStats?.acSubmissionNum ?? [];

        const getAC = (diff) => acNums.find((a) => a.difficulty === diff)?.count ?? 0;
        const getQ  = (diff) => allQ.find((q) => q.difficulty === diff)?.count ?? 0;
        const getTotalSub = () => acNums.reduce((s, a) => s + (a.submissions ?? 0), 0);

        const easySolved   = getAC('Easy');
        const mediumSolved = getAC('Medium');
        const hardSolved   = getAC('Hard');
        const totalSolved  = easySolved + mediumSolved + hardSolved;

        const { current: currentStreak, longest: longestStreak } =
          deriveStreakFromCalendar(matched?.submissionCalendar);

        const calendarArray = buildSubmissionCalendar(matched?.submissionCalendar);

        update.leetcode = {
          totalSolved,
          easy:   { solved: easySolved,   total: getQ('Easy'),   percentage: getQ('Easy')   ? Math.round(easySolved   / getQ('Easy')   * 100) : 0 },
          medium: { solved: mediumSolved, total: getQ('Medium'), percentage: getQ('Medium') ? Math.round(mediumSolved / getQ('Medium') * 100) : 0 },
          hard:   { solved: hardSolved,   total: getQ('Hard'),   percentage: getQ('Hard')   ? Math.round(hardSolved   / getQ('Hard')   * 100) : 0 },
          globalRanking:        matched?.profile?.ranking ?? null,
          totalSubmissions:     getTotalSub(),
          contestsParticipated: contestData?.attendedContestsCount ?? 0,
          contestRating:        contestData?.rating ?? 0,
          currentStreak,
          longestStreak,
          recentSubmissions: (recentSubs ?? []).slice(0, 10).map((s) => ({
            problem:     s.title,
            difficulty:  'Medium',
            status:      s.statusDisplay,
            language:    s.lang,
            submittedAt: new Date(parseInt(s.timestamp) * 1000),
            platform:    'leetcode',
          })),
        };

        update['submissionCalendar.leetcode'] = calendarArray;
      } catch (e) {
        console.error(`[sync:lc] ${user.leetcodeUsername}: ${e.message}`);
      }
    }

    await sleep(300);

    if (user.codeforcesUsername) {
      try {
        const [cfSubs, cfInfo] = await Promise.all([
          fetchCFSubmissions(user.codeforcesUsername, 100),
          fetchCFUserInfo(user.codeforcesUsername),
        ]);

        const cfStats = computeCodeforcesStats(cfSubs);
        update.codeforces = {
          ...cfStats,
          globalRanking: cfInfo.rank,
          contestRating: cfInfo.rating,
        };
      } catch (e) {
        console.error(`[sync:cf] ${user.codeforcesUsername}: ${e.message}`);
      }
    }

    if (update.leetcode || update.codeforces) {
      const lc = update.leetcode ?? {};
      const cf = update.codeforces ?? {};
      update.combined = {
        totalSolved:      (lc.totalSolved ?? 0) + (cf.totalSolved ?? 0),
        easy:             { solved: (lc.easy?.solved ?? 0) + (cf.easy?.solved ?? 0) },
        medium:           { solved: (lc.medium?.solved ?? 0) + (cf.medium?.solved ?? 0) },
        hard:             { solved: (lc.hard?.solved ?? 0) + (cf.hard?.solved ?? 0) },
        totalSubmissions: (lc.totalSubmissions ?? 0) + (cf.totalSubmissions ?? 0),
        recentSubmissions:[...(lc.recentSubmissions ?? []), ...(cf.recentSubmissions ?? [])].slice(0, 10),
      };
    }

    const existing = await CodingStat.findOne({ userId: user._id });
    const docForScore = { ...existing?.toObject(), ...update };
    update.leetcodeScore = computeLeetcodeScore(docForScore);

    const prev = existing?.leetcode?.totalSolved ?? 0;
    const next = update.leetcode?.totalSolved ?? 0;

    await CodingStat.findOneAndUpdate(
      { userId: user._id },
      { $set: update },
      { upsert: true }
    );

    if (next > prev) {
      await ActivityLog.create({
        userId: user._id,
        type:   'solve',
        text:   `Solved ${next - prev} new problem${next - prev > 1 ? 's' : ''} on LeetCode`,
      });
    }
  } catch (err) {
    console.error(`[sync:coding] User ${user._id}: ${err.message}`);
  }
}

export function scheduleCodingSync(schedule) {
  cron.schedule(schedule, async () => {
    console.log('[cron] Starting coding stats sync...');
    const users = await User.find({
      role: 'student',
      $or: [
        { leetcodeUsername: { $ne: '' } },
        { codeforcesUsername: { $ne: '' } },
      ],
    }).lean();

    console.log(`[cron] Syncing ${users.length} students`);
    const BATCH = 10;
    for (let i = 0; i < users.length; i += BATCH) {
      const batch = users.slice(i, i + BATCH);
      await Promise.all(batch.map(syncUser));
      if (i + BATCH < users.length) await sleep(2000);
    }
    console.log('[cron] Coding stats sync complete');
  });
}
