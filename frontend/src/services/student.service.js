// Service layer for student dashboard data.
//
// Each function returns a Promise that currently resolves with mock data.
// To wire up the real MERN backend later, replace the body of each function
// with an `api.get(...)` call. The shape of returned data already mirrors the
// future MongoDB documents, so React components and hooks won't change.
//
// Example future implementation:
//   export async function getProfile() {
//     const { data } = await api.get('/student/profile');
//     return data;
//   }

// import api from './api';
import {
  studentProfile,
  codingStats,
  problemsOverTime,
  githubActivity,
  recentActivity,
  leaderboardSnapshot,
  notifications,
  codingProgress,
  leaderboardData,
  githubActivityPage,
} from '@/data/student.mock';
import { immersionExamResultsByWeek, IMMERSION_WEEKS } from '@/data/trainer.mock';

const ME_MARKS_BY_WEEK = { 7: 58, 8: 65, 9: 55, 10: 69, 11: 71, 12: 72 };

function buildImmersionRows(weekNum) {
  const marks = ME_MARKS_BY_WEEK[weekNum] ?? 72;
  const me = {
    _id: 'me',
    name: 'Pawan Kumar',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
    branch: 'CSE',
    marks,
    status: marks >= 40 ? 'Pass' : 'Fail',
    grade: marks >= 75 ? 'Good' : marks >= 50 ? 'Average' : 'Poor',
    weakArea: marks < 75 ? 'Sliding Window' : null,
    isMe: true,
  };
  return [...(immersionExamResultsByWeek[weekNum] ?? immersionExamResultsByWeek[12]), me]
    .sort((a, b) => b.marks - a.marks)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

const simulate = (payload, delay = 250) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(payload)), delay));

export function getProfile() {
  return simulate(studentProfile);
}

export function getCodingStats() {
  return simulate(codingStats);
}

export function getProblemsOverTime() {
  return simulate(problemsOverTime);
}

export function getGithubActivity() {
  return simulate(githubActivity);
}

export function getRecentActivity() {
  return simulate(recentActivity);
}

export function getLeaderboardSnapshot() {
  return simulate(leaderboardSnapshot);
}

export function getNotifications() {
  return simulate(notifications);
}

// Coding Progress page
// Future: api.get(`/student/coding-progress?platform=${platform}`)
export function getCodingProgress(platform = 'all') {
  return simulate(codingProgress[platform] ?? codingProgress.all);
}

// Leaderboard page
// Future: api.get(`/leaderboard?platform=${platform}&time=${time}`)
export function getLeaderboard(platform = 'leetcode', time = 'weekly') {
  return simulate((leaderboardData[platform] ?? leaderboardData.leetcode)[time] ?? leaderboardData.leetcode.weekly);
}

// GitHub Activity page
// Future: api.get(`/student/github-activity?range=${range}`)
export function getGithubActivityPage() {
  return simulate(githubActivityPage);
}

// Immersion Leaderboard
// Future: api.get('/leaderboard/immersion?week=12')
export function getImmersionLeaderboard(week = 12) {
  const rows = buildImmersionRows(week);
  const me = rows.find((r) => r.isMe);
  const myRank = me?.rank ?? 1;
  const top3 = rows.slice(0, 3);
  const low = Math.max(0, myRank - 6);
  const high = Math.min(rows.length, myRank + 5);
  const around = rows.slice(low, high);
  const weekMeta = IMMERSION_WEEKS.find((w) => w.week === week) ?? IMMERSION_WEEKS[IMMERSION_WEEKS.length - 1];
  return simulate({ top3, around, me, total: rows.length, weekMeta });
}

export function getDashboard() {
  // A single roll-up call so a future `/api/student/dashboard` endpoint can
  // serve everything in one network round trip.
  return Promise.all([
    getProfile(),
    getCodingStats(),
    getProblemsOverTime(),
    getGithubActivity(),
    getRecentActivity(),
    getLeaderboardSnapshot(),
    getNotifications(),
  ]).then(
    ([profile, stats, problemsTimeline, github, activity, leaderboard, notes]) => ({
      profile,
      stats,
      problemsTimeline,
      github,
      activity,
      leaderboard,
      notifications: notes,
    }),
  );
}
