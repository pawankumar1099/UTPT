import User from '../models/User.js';
import GithubStat from '../models/GithubStat.js';
import ActivityLog from '../models/ActivityLog.js';
import { fetchFullGithubData } from '../services/github.service.js';
import { computeGithubScore } from '../services/score.service.js';

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export async function syncGithubStatsForUser(user) {
  if (!user.githubUsername) {
    console.log(`  [skip] ${user.name} — no GitHub username`);
    return;
  }

  const ghData = await fetchFullGithubData(user.githubUsername);
  if (!ghData) {
    console.log(`  [skip] ${user.name} — GitHub fetch returned null`);
    return;
  }

  const ghScore = computeGithubScore(ghData);

  const existing = await GithubStat.findOne({ userId: user._id });
  const prevCommits = existing?.totalCommits ?? 0;
  const prevPRs     = existing?.pullRequests ?? 0;

  const update = {
    userId:              user._id,
    totalCommits:        ghData.totalCommits,
    totalCommitsChange:  ghData.totalCommitsChange,
    pullRequests:        ghData.pullRequests,
    pullRequestsChange:  ghData.pullRequestsChange,
    repositories:        ghData.repositories,
    status:              ghData.status,
    contributionHeatmap: ghData.contributionHeatmap,
    calendarDays:        ghData.calendarDays,
    weekLabels:          ghData.weekLabels,
    commitsOverTime:     ghData.commitsOverTime,
    topRepositories:     ghData.topRepositories,
    recentEvents:        ghData.recentEvents,
    githubScore:         ghScore,
    lastSyncedAt:        new Date(),
  };

  if (ghData.avatarUrl && !user.avatarUrl) {
    await User.findByIdAndUpdate(user._id, { avatarUrl: ghData.avatarUrl });
  }

  await GithubStat.findOneAndUpdate(
    { userId: user._id },
    { $set: update },
    { upsert: true, new: true }
  );

  const activityLogs = [];
  if (ghData.totalCommits > prevCommits) {
    const diff = ghData.totalCommits - prevCommits;
    activityLogs.push({ userId: user._id, type: 'commit', text: `Pushed ${diff} new commit${diff > 1 ? 's' : ''} on GitHub` });
  }
  if (ghData.pullRequests > prevPRs) {
    const diff = ghData.pullRequests - prevPRs;
    activityLogs.push({ userId: user._id, type: 'pr', text: `Opened ${diff} new pull request${diff > 1 ? 's' : ''} on GitHub` });
  }

  if (activityLogs.length > 0) {
    await ActivityLog.insertMany(activityLogs);
  }

  await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

  console.log(`  [ok] ${user.name} — commits:${ghData.totalCommits} repos:${ghData.repositories} score:${ghScore}`);
}

export async function syncAllGithubStats() {
  console.log('\n[GithubSync] Starting...');
  const users = await User.find({ role: 'student', githubUsername: { $ne: '' } });
  console.log(`[GithubSync] Found ${users.length} students with GitHub`);

  let success = 0;
  let failed  = 0;

  for (const user of users) {
    try {
      await syncGithubStatsForUser(user);
      success++;
    } catch (err) {
      console.error(`  [err] ${user.name}: ${err.message}`);
      failed++;
    }
    await delay(1200);
  }

  console.log(`[GithubSync] Done — ${success} success, ${failed} failed\n`);
}
