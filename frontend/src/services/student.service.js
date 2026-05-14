import api from './api';

export async function getProfile() {
  const { data } = await api.get('/student/profile');
  return data.data;
}

export async function getCodingStats() {
  const { data } = await api.get('/student/coding-stats');
  return data.data;
}

export async function getProblemsOverTime() {
  const { data } = await api.get('/student/coding-progress');
  return data.data.problemsOverTime ?? [];
}

export async function getGithubActivity() {
  const { data } = await api.get('/student/dashboard');
  return data.data.github;
}

export async function getRecentActivity() {
  const { data } = await api.get('/student/activity');
  return data.data;
}

export async function getLeaderboardSnapshot() {
  const { data } = await api.get('/leaderboard?platform=combined&time=weekly');
  return { top: data.data.rows?.slice(0, 3) ?? [], you: data.data.you };
}

export async function getNotifications() {
  const { data } = await api.get('/student/notifications');
  return data.data;
}

export async function getCodingProgress(platform = 'all') {
  const { data } = await api.get(`/student/coding-progress?platform=${platform}`);
  return data.data;
}

export async function getLeaderboard(platform = 'leetcode', time = 'weekly') {
  const { data } = await api.get(`/leaderboard?platform=${platform}&time=${time}`);
  return data.data;
}

export async function getGithubActivityPage() {
  const { data } = await api.get('/student/github-activity');
  return data.data;
}

export async function getImmersionLeaderboard(week = 12) {
  const { data } = await api.get(`/leaderboard/immersion?week=${week}`);
  return data.data;
}

export async function getDashboard() {
  const { data } = await api.get('/student/dashboard');
  return data.data;
}
