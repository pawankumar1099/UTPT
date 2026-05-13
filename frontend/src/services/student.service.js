import api from './api';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Convert a flat heatmap array (rows*cols) into a 2D array [rows][cols]
function reshapeHeatmap(flat, rows, cols) {
  if (!flat || flat.length === 0) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
  }
  const result = [];
  for (let r = 0; r < rows; r++) {
    result.push(flat.slice(r * cols, r * cols + cols));
  }
  return result;
}

// Safe API call — returns null on 404 (stats not synced yet) and rethrows others
async function safeGet(url, params) {
  try {
    const { data } = await api.get(url, { params });
    return data.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function getProfile() {
  return safeGet('/student/profile');
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboard() {
  const [dashData, progressData] = await Promise.all([
    safeGet('/student/dashboard'),
    safeGet('/student/coding-progress', { platform: 'all' }),
  ]);

  if (!dashData) return buildEmptyDashboard();

  const github = dashData.github ?? {};

  return {
    profile:          dashData.profile,
    stats:            normalizeStats(dashData.stats),
    problemsTimeline: progressData?.problemsOverTime ?? [],
    github: {
      totalCommits: github.totalCommits ?? 0,
      repositories: github.repositories ?? 0,
      status:       github.status ?? 'Inactive',
      username:     dashData.profile?.githubUsername ?? '',
      heatmap:      reshapeHeatmap([], 7, 26),
      months:       ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
      recentRepos:  [],
    },
    activity:      dashData.activity ?? [],
    leaderboard:   dashData.leaderboard ?? { top: [], you: null },
    notifications: dashData.notifications ?? [],
  };
}

function normalizeStats(stats) {
  if (!stats) return emptyStats();
  return {
    totalSolved:   stats.totalSolved ?? 0,
    easy:          stats.easy   ?? { solved: 0, total: 800,  percentage: 0 },
    medium:        stats.medium ?? { solved: 0, total: 1500, percentage: 0 },
    hard:          stats.hard   ?? { solved: 0, total: 700,  percentage: 0 },
    currentStreak: stats.currentStreak ?? 0,
    longestStreak: stats.longestStreak ?? 0,
    totalCommits:  stats.totalCommits  ?? 0,
    rank:          stats.rank          ?? null,
    ranking:       stats.ranking       ?? { batch: null, branch: null, specialization: null },
  };
}

function emptyStats() {
  return {
    totalSolved: 0,
    easy:   { solved: 0, total: 800,  percentage: 0 },
    medium: { solved: 0, total: 1500, percentage: 0 },
    hard:   { solved: 0, total: 700,  percentage: 0 },
    currentStreak: 0, longestStreak: 0,
    totalCommits: 0, rank: null,
    ranking: { batch: null, branch: null, specialization: null },
  };
}

function buildEmptyDashboard() {
  return {
    profile:          null,
    stats:            emptyStats(),
    problemsTimeline: [],
    github:           { totalCommits: 0, repositories: 0, status: 'Inactive', username: '', heatmap: reshapeHeatmap([], 7, 26), months: [], recentRepos: [] },
    activity:         [],
    leaderboard:      { top: [], you: null },
    notifications:    [],
  };
}

// ── Coding stats (dashboard home summary) ────────────────────────────────────

export async function getCodingStats() {
  const d = await safeGet('/student/coding-stats');
  return d ? normalizeStats(d) : emptyStats();
}

// ── Coding progress page ──────────────────────────────────────────────────────

export async function getCodingProgress(platform = 'all') {
  const d = await safeGet('/student/coding-progress', { platform });
  if (!d) {
    return {
      stats: { totalSolved: 0, easy: {}, medium: {}, hard: {}, globalRanking: null, acceptanceRate: null, totalSubmissions: 0, contestsParticipated: 0, contestRating: null },
      currentStreak: 0, longestStreak: 0, longestStreakRange: null,
      problemsOverTime: [],
      calendarMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      calendarDays: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
      submissionCalendar: reshapeHeatmap([], 5, 20),
      recentSubmissions: [],
    };
  }
  return {
    ...d,
    submissionCalendar: Array.isArray(d.submissionCalendar?.[0])
      ? d.submissionCalendar
      : reshapeHeatmap(d.submissionCalendar ?? [], 5, 20),
    calendarMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    calendarDays:   ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
  };
}

// ── GitHub activity ───────────────────────────────────────────────────────────

export async function getGithubActivity() {
  const d = await safeGet('/student/github-activity');
  if (!d) return { totalCommits: 0, repositories: 0, status: 'Inactive', heatmap: reshapeHeatmap([], 7, 26), months: [], recentRepos: [] };
  return {
    totalCommits: d.totalCommits ?? 0,
    repositories: d.repositories ?? 0,
    status:       d.status ?? 'Inactive',
    heatmap:      reshapeHeatmap(d.contributionHeatmap ?? [], 7, 26),
    months:       d.weekLabels ?? [],
    recentRepos:  (d.topRepositories ?? []).map((r) => ({
      _id: r.repoId ?? r.name, name: r.name, status: r.status, updatedAt: r.updatedAt,
    })),
  };
}

export async function getGithubActivityPage() {
  const d = await safeGet('/student/github-activity');
  if (!d) return {
    totalCommits: 0, totalCommitsChange: 0, pullRequests: 0, pullRequestsChange: 0, repositories: 0,
    contributionHeatmap: reshapeHeatmap([], 3, 30), calendarDays: ['Mon', 'Wed', 'Fri'],
    weekLabels: [], commitsOverTime: [], topRepositories: [], recentEvents: [],
  };
  return {
    ...d,
    contributionHeatmap: Array.isArray(d.contributionHeatmap?.[0])
      ? d.contributionHeatmap
      : reshapeHeatmap(d.contributionHeatmap ?? [], 3, 30),
  };
}

// ── Activity feed ─────────────────────────────────────────────────────────────

export async function getRecentActivity() {
  const d = await safeGet('/student/activity');
  return d ?? [];
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function getNotifications() {
  const d = await safeGet('/student/notifications');
  return d ?? [];
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/student/notifications/${id}/read`);
  return data.data;
}

// ── Problems over time (standalone) ──────────────────────────────────────────

export async function getProblemsOverTime() {
  const d = await safeGet('/student/coding-progress', { platform: 'all' });
  return d?.problemsOverTime ?? [];
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard(platform = 'leetcode', time = 'weekly') {
  const d = await safeGet('/leaderboard', { platform, time });
  if (!d) return { rows: [], you: null };
  return { rows: d.rows ?? [], you: d.you ?? null };
}

export async function getLeaderboardSnapshot() {
  const d = await safeGet('/leaderboard', { platform: 'combined', time: 'weekly' });
  if (!d) return { top: [], you: null };
  return { top: (d.rows ?? []).slice(0, 3), you: d.you ?? null };
}

// ── Immersion leaderboard ─────────────────────────────────────────────────────

export async function getImmersionLeaderboard(week = 1) {
  const d = await safeGet('/leaderboard/immersion', { week });
  if (!d) return { top3: [], around: [], me: null, total: 0, weekMeta: null };
  return d;
}
