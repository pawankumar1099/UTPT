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
} from '@/data/student.mock';

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
