import axios from 'axios';

const BASE = 'https://api.github.com';

function headers() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export async function fetchUserInfo(username) {
  const { data } = await axios.get(`${BASE}/users/${username}`, {
    headers: headers(),
    timeout: 15000,
  });
  return {
    publicRepos: data.public_repos,
    followers:   data.followers,
    avatarUrl:   data.avatar_url,
    name:        data.name ?? data.login,
  };
}

export async function fetchRepos(username) {
  const { data } = await axios.get(
    `${BASE}/users/${username}/repos?sort=pushed&per_page=30&type=owner`,
    { headers: headers(), timeout: 15000 }
  );
  return data.map(r => ({
    repoId:    String(r.id),
    name:      r.name,
    language:  r.language ?? 'Unknown',
    updatedAt: new Date(r.pushed_at),
  }));
}

export async function fetchRepoCommitCount(owner, repo, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  try {
    const { data } = await axios.get(
      `${BASE}/repos/${owner}/${repo}/commits?since=${since}&per_page=100`,
      { headers: headers(), timeout: 15000 }
    );
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export async function fetchEvents(username) {
  const { data } = await axios.get(
    `${BASE}/users/${username}/events?per_page=100`,
    { headers: headers(), timeout: 15000 }
  );
  return Array.isArray(data) ? data : [];
}

export function computeCommitsOverTime(events, days = 30) {
  const now = Date.now();
  const ONE_DAY_MS = 86400000;
  const buckets = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * ONE_DAY_MS);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets[d.toISOString().slice(0, 10)] = { label, commits: 0 };
  }

  for (const e of events) {
    if (e.type !== 'PushEvent') continue;
    const key = e.created_at?.slice(0, 10);
    if (buckets[key]) {
      const count = e.payload?.commits?.length ?? 0;
      buckets[key].commits += count;
    }
  }

  return Object.values(buckets).map(b => ({ date: b.label, commits: b.commits }));
}

export function buildContributionHeatmap(events) {
  const now = Date.now();
  const ONE_DAY_MS = 86400000;
  const ROWS = 3;
  const COLS = 30;
  const flat = [];

  const dayMap = {};
  for (const e of events) {
    if (e.type !== 'PushEvent') continue;
    const key = e.created_at?.slice(0, 10);
    if (!key) continue;
    const count = e.payload?.commits?.length ?? 0;
    dayMap[key] = (dayMap[key] ?? 0) + count;
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const dayOffset = ROWS * COLS - 1 - idx;
      const d = new Date(now - dayOffset * ONE_DAY_MS);
      const key = d.toISOString().slice(0, 10);
      const count = dayMap[key] ?? 0;
      flat.push(Math.min(4, count > 0 ? (count >= 10 ? 4 : count >= 6 ? 3 : count >= 3 ? 2 : 1) : 0));
    }
  }
  return flat;
}

export function buildWeekLabels() {
  const now = Date.now();
  const ONE_DAY_MS = 86400000;
  const labels = [];
  for (let w = 4; w >= 0; w--) {
    const d = new Date(now - w * 7 * ONE_DAY_MS);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
}

export function extractRecentEvents(events) {
  const seen = new Set();
  const result = [];
  const now = Date.now();

  for (const e of events) {
    if (result.length >= 10) break;
    const key = `${e.type}-${e.repo?.name}-${e.created_at}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const repoName = e.repo?.name?.split('/')[1] ?? e.repo?.name ?? '';
    const occurredAt = new Date(e.created_at);
    const diffMs = now - occurredAt.getTime();
    const diffH  = Math.floor(diffMs / 3600000);
    const diffD  = Math.floor(diffMs / 86400000);
    const ago    = diffD >= 1 ? `${diffD} day${diffD > 1 ? 's' : ''} ago` : `${diffH || 1} hour${diffH !== 1 ? 's' : ''} ago`;

    if (e.type === 'PushEvent') {
      const msg = e.payload?.commits?.[0]?.message ?? 'Pushed commits';
      result.push({ type: 'push', repo: repoName, message: msg.slice(0, 80), branch: e.payload?.ref?.replace('refs/heads/', '') ?? 'main', ago, occurredAt });
    } else if (e.type === 'PullRequestEvent') {
      const title = e.payload?.pull_request?.title ?? 'Pull request';
      result.push({ type: 'pr', repo: repoName, message: title.slice(0, 80), branch: e.payload?.pull_request?.head?.ref ?? '', ago, occurredAt });
    } else if (e.type === 'ForkEvent') {
      result.push({ type: 'fork', repo: repoName, message: 'Forked repository', branch: '', ago, occurredAt });
    } else if (e.type === 'WatchEvent') {
      result.push({ type: 'star', repo: repoName, message: 'Starred repository', branch: '', ago, occurredAt });
    }
  }
  return result;
}

export async function fetchFullGithubData(username) {
  const [userInfo, repos, events] = await Promise.all([
    fetchUserInfo(username),
    fetchRepos(username),
    fetchEvents(username),
  ]);

  const pushEvents = events.filter(e => e.type === 'PushEvent');
  const totalCommits = pushEvents.reduce((sum, e) => sum + (e.payload?.commits?.length ?? 0), 0);
  const pullRequests = events.filter(e => e.type === 'PullRequestEvent').length;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const recentPushes = pushEvents.filter(e => new Date(e.created_at) > thirtyDaysAgo);
  const recentCommits = recentPushes.reduce((sum, e) => sum + (e.payload?.commits?.length ?? 0), 0);

  const commitsOverTime = computeCommitsOverTime(events);
  const heatmap = buildContributionHeatmap(events);
  const weekLabels = buildWeekLabels();
  const recentEvents = extractRecentEvents(events);

  const topRepos = repos
    .map(r => {
      const repoEvents = events.filter(e => e.type === 'PushEvent' && e.repo?.name?.endsWith(`/${r.name}`));
      const commits = repoEvents.reduce((sum, e) => sum + (e.payload?.commits?.length ?? 0), 0);
      const daysSince = (Date.now() - r.updatedAt.getTime()) / 86400000;
      return { ...r, commits, status: daysSince <= 14 ? 'Active' : 'Inactive' };
    })
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 8);

  const lastEventAt = events[0]?.created_at ? new Date(events[0].created_at) : null;
  const daysSinceActive = lastEventAt ? (Date.now() - lastEventAt.getTime()) / 86400000 : 999;
  const status = daysSinceActive <= 7 ? 'Active' : 'Inactive';

  return {
    avatarUrl:            userInfo.avatarUrl,
    totalCommits,
    totalCommitsChange:   recentCommits,
    pullRequests,
    pullRequestsChange:   pullRequests,
    repositories:         userInfo.publicRepos,
    status,
    contributionHeatmap:  heatmap,
    calendarDays:         ['Mon', 'Wed', 'Fri'],
    weekLabels,
    commitsOverTime,
    topRepositories:      topRepos,
    recentEvents,
  };
}
