import cron from 'node-cron';
import User from '../models/User.js';
import GithubStat from '../models/GithubStat.js';
import {
  fetchUserInfo,
  fetchRepos,
  fetchTotalCommits,
  fetchPullRequests,
  fetchContributionCalendar,
  buildHeatmapFromCalendar,
} from '../services/github.service.js';
import { computeGithubScore } from '../services/score.service.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function syncUser(user) {
  try {
    const [info, repos, totalCommits, prs, calendarWeeks] = await Promise.all([
      fetchUserInfo(user.githubUsername),
      fetchRepos(user.githubUsername),
      fetchTotalCommits(user.githubUsername),
      fetchPullRequests(user.githubUsername),
      fetchContributionCalendar(user.githubUsername),
    ]);

    const heatmap = buildHeatmapFromCalendar(calendarWeeks);
    const allDays = calendarWeeks.flatMap((w) => w.contributionDays);
    const last30  = allDays.slice(-30);

    const commitsOverTime = last30.map((d) => ({
      date:    new Date(0 + d.weekday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      commits: d.contributionCount,
    }));

    const weekLabels = [];
    const calWeeks   = calendarWeeks.slice(-5);
    for (const w of calWeeks) {
      const firstDay = w.contributionDays[0];
      if (firstDay) {
        weekLabels.push(new Date(firstDay.date ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    }

    const activeRepos = repos.filter((r) => {
      const d = new Date(r.updatedAt);
      return d >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    });

    const topRepositories = activeRepos.slice(0, 5).map((r) => ({
      ...r,
      commits: 0,
      status:  'Active',
    }));

    const stat = {
      userId:              user._id,
      totalCommits,
      pullRequests:        prs,
      repositories:        info.publicRepos,
      status:              totalCommits > 0 ? 'Active' : 'Inactive',
      contributionHeatmap: heatmap,
      calendarDays:        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weekLabels,
      commitsOverTime,
      topRepositories,
      recentEvents:        [],
      lastSyncedAt:        new Date(),
    };

    stat.githubScore = computeGithubScore(stat);

    await GithubStat.findOneAndUpdate(
      { userId: user._id },
      { $set: stat },
      { upsert: true }
    );
  } catch (err) {
    console.error(`[sync:github] ${user.githubUsername}: ${err.message}`);
  }
}

export function scheduleGithubSync(schedule) {
  cron.schedule(schedule, async () => {
    console.log('[cron] Starting GitHub stats sync...');
    const users = await User.find({ role: 'student', githubUsername: { $ne: '' } }).lean();
    console.log(`[cron] Syncing ${users.length} students`);

    const BATCH = 10;
    for (let i = 0; i < users.length; i += BATCH) {
      const batch = users.slice(i, i + BATCH);
      await Promise.all(batch.map(syncUser));
      if (i + BATCH < users.length) await sleep(2000);
    }
    console.log('[cron] GitHub stats sync complete');
  });
}
