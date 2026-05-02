// Trainer service — mirrors student.service.js pattern.
// Every function currently wraps mock data in a simulated delay.
// When the backend is ready, replace simulate(data) with the commented api.get() call.

import api from './api';
import {
  trainerProfile,
  trainerOverview,
  activityTrend,
  allStudents,
  topPerformers,
  atRiskStudents,
  insights,
} from '@/data/trainer.mock';

const simulate = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

// GET /trainer/overview
export const getTrainerOverview = () =>
  simulate({ profile: trainerProfile, overview: trainerOverview });
// Real: return api.get('/trainer/overview').then(r => r.data);

// GET /trainer/students?page=1&limit=20&search=&filter=all
export const getStudents = ({ page = 1, limit = 20, search = '', filter = 'all' } = {}) => {
  let filtered = [...allStudents];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((s) => s.name.toLowerCase().includes(q));
  }

  if (filter === 'active') filtered = filtered.filter((s) => s.status === 'Active');
  else if (filter === 'inactive') filtered = filtered.filter((s) => s.status === 'Inactive');
  else if (filter === 'top') filtered = filtered.filter((s) => s.score >= 1500);
  else if (filter === 'at-risk') filtered = filtered.filter((s) => s.isAtRisk);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const rows = filtered.slice(start, start + limit);

  return simulate({ rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  // Real: return api.get('/trainer/students', { params: { page, limit, search, filter } }).then(r => r.data);
};

// GET /trainer/activity-trend
export const getActivityTrend = () =>
  simulate(activityTrend);
// Real: return api.get('/trainer/activity-trend').then(r => r.data);

// GET /trainer/top-performers
export const getTopPerformers = () =>
  simulate(topPerformers);
// Real: return api.get('/trainer/top-performers').then(r => r.data);

// GET /trainer/at-risk
export const getAtRiskStudents = () =>
  simulate(atRiskStudents);
// Real: return api.get('/trainer/at-risk').then(r => r.data);

// GET /trainer/insights
export const getInsights = () =>
  simulate(insights);
// Real: return api.get('/trainer/insights').then(r => r.data);

// GET /trainer/students/:id
export const getStudentById = (id) => {
  const student = allStudents.find((s) => s._id === id) ?? null;
  return simulate(student);
  // Real: return api.get(`/trainer/students/${id}`).then(r => r.data);
};

// Aggregate call used by the trainer dashboard page
export const getTrainerDashboard = async () => {
  const [overviewRes, trendRes, topRes, atRiskRes, insightsRes] = await Promise.all([
    getTrainerOverview(),
    getActivityTrend(),
    getTopPerformers(),
    getAtRiskStudents(),
    getInsights(),
  ]);
  return {
    profile: overviewRes.profile,
    overview: overviewRes.overview,
    trend: trendRes,
    topPerformers: topRes,
    atRisk: atRiskRes,
    insights: insightsRes,
  };
};
