import axios from 'axios';

const BASE = 'https://api.github.com';
const headers = () => ({
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
});

export async function fetchUserInfo(username) {
  const { data } = await axios.get(`${BASE}/users/${username}`, { headers: headers(), timeout: 15000 });
  return {
    publicRepos: data.public_repos,
    followers:   data.followers,
    avatarUrl:   data.avatar_url,
  };
}

export async function fetchRepos(username) {
  const { data } = await axios.get(
    `${BASE}/users/${username}/repos?sort=pushed&per_page=30`,
    { headers: headers(), timeout: 15000 }
  );
  return data.map((r) => ({
    repoId:    String(r.id),
    name:      r.name,
    language:  r.language ?? 'Unknown',
    updatedAt: r.pushed_at,
  }));
}

export async function fetchRepoCommitCount(owner, repo) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await axios.get(
    `${BASE}/repos/${owner}/${repo}/commits?since=${since}&per_page=100`,
    { headers: headers(), timeout: 15000 }
  );
  return data.length;
}

export async function fetchTotalCommits(username) {
  const { data } = await axios.get(
    `${BASE}/users/${username}/events?per_page=100`,
    { headers: headers(), timeout: 15000 }
  );
  const pushEvents = data.filter((e) => e.type === 'PushEvent');
  return pushEvents.reduce((acc, e) => acc + (e.payload.commits?.length ?? 0), 0);
}

export async function fetchContributionCalendar(username) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays { contributionCount weekday }
            }
          }
        }
      }
    }
  `;
  const { data } = await axios.post(
    'https://api.github.com/graphql',
    { query, variables: { username } },
    { headers: headers(), timeout: 15000 }
  );
  return data.data.user.contributionsCollection.contributionCalendar.weeks;
}

export async function fetchPullRequests(username) {
  const { data } = await axios.get(
    `${BASE}/search/issues?q=author:${username}+type:pr&per_page=1`,
    { headers: headers(), timeout: 15000 }
  );
  return data.total_count;
}

export function buildHeatmapFromCalendar(weeks, rows = 3, cols = 30) {
  const days = weeks.flatMap((w) => w.contributionDays);
  const last = days.slice(-rows * cols);
  while (last.length < rows * cols) last.unshift({ contributionCount: 0 });

  return last.map(({ contributionCount: c }) =>
    c === 0 ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 10 ? 3 : 4
  );
}
