import api from './api';

async function safeGet(url, params) {
  try {
    const { data } = await api.get(url, { params });
    return data.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

// ── Overview ──────────────────────────────────────────────────────────────────

export const getTrainerOverview = async () => {
  const d = await safeGet('/trainer/overview');
  if (!d) return { profile: null, overview: emptyOverview() };
  return d;
};

function emptyOverview() {
  return {
    totalStudents: 0, totalStudentsChange: 0,
    activeStudents: 0, activeStudentsChange: 0,
    inactiveStudents: 0, inactiveStudentsChange: 0,
    avgProblemsSolved: 0, avgProblemsSolvedChange: 0,
    avgStreak: 0, avgStreakChange: 0,
  };
}

// ── Students list ─────────────────────────────────────────────────────────────

export const getStudents = async ({ page = 1, limit = 20, search = '', filter = 'all' } = {}) => {
  const d = await safeGet('/trainer/students', { page, limit, search, filter });
  if (!d) return { rows: [], total: 0, page: 1, limit, totalPages: 0 };
  return d;
};

// ── Single student ────────────────────────────────────────────────────────────

export const getStudentById = async (id) => {
  const d = await safeGet(`/trainer/students/${id}`);
  return d;
};

// ── Activity trend ────────────────────────────────────────────────────────────

export const getActivityTrend = async () => {
  const d = await safeGet('/trainer/activity-trend');
  return d ?? [];
};

// ── Top performers ────────────────────────────────────────────────────────────

export const getTopPerformers = async () => {
  const d = await safeGet('/trainer/top-performers');
  return d ?? [];
};

// ── At-risk students ──────────────────────────────────────────────────────────

export const getAtRiskStudents = async () => {
  const d = await safeGet('/trainer/at-risk');
  return d ?? [];
};

// ── Insights ──────────────────────────────────────────────────────────────────

export const getInsights = async () => {
  const d = await safeGet('/trainer/insights');
  return d ?? [];
};

// ── Immersion exam ────────────────────────────────────────────────────────────

export const getImmersionExam = async () => {
  const d = await safeGet('/trainer/immersion-exam/latest');
  return d ?? null;
};

export const getImmersionExamResults = async () => {
  const exam = await getImmersionExam();
  if (!exam?.exam?.week) return [];
  const d = await safeGet(`/trainer/immersion-exam/${exam.exam.week}/results`);
  return d ?? [];
};

export const getImmersionExamResultsByWeek = async (week) => {
  const d = await safeGet(`/trainer/immersion-exam/${week}/results`);
  return d ?? [];
};

export const createImmersionExam = async (payload) => {
  const { data } = await api.post('/trainer/immersion-exam', payload);
  return data.data;
};

export const uploadImmersionResults = async (week, results) => {
  const { data } = await api.post(`/trainer/immersion-exam/${week}/results`, { results });
  return data.data;
};

// ── Trainer dashboard (aggregate) ─────────────────────────────────────────────

export const getTrainerDashboard = async () => {
  const [overviewRes, trendRes, topRes, atRiskRes, insightsRes, examRes] = await Promise.all([
    getTrainerOverview(),
    getActivityTrend(),
    getTopPerformers(),
    getAtRiskStudents(),
    getInsights(),
    getImmersionExam(),
  ]);

  const latestWeek = examRes?.exam?.week;
  const examResultsRes = latestWeek
    ? await getImmersionExamResultsByWeek(latestWeek)
    : [];

  return {
    profile:              overviewRes.profile,
    overview:             overviewRes.overview,
    trend:                trendRes,
    topPerformers:        topRes,
    atRisk:               atRiskRes,
    insights:             insightsRes,
    immersionExam:        examRes?.exam ?? null,
    immersionExamResults: examResultsRes,
  };
};
