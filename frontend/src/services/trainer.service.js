import api from './api';

export const getTrainerOverview = async () => {
  const { data } = await api.get('/trainer/overview');
  return data.data;
};

export const getStudents = async ({ page = 1, limit = 20, search = '', filter = 'all' } = {}) => {
  const { data } = await api.get('/trainer/students', { params: { page, limit, search, filter } });
  return data.data;
};

export const getActivityTrend = async () => {
  const { data } = await api.get('/trainer/activity-trend');
  return data.data;
};

export const getTopPerformers = async () => {
  const { data } = await api.get('/trainer/top-performers');
  return data.data;
};

export const getAtRiskStudents = async () => {
  const { data } = await api.get('/trainer/at-risk');
  return data.data;
};

export const getInsights = async () => {
  const { data } = await api.get('/trainer/insights');
  return data.data;
};

export const getImmersionExam = async () => {
  const { data } = await api.get('/trainer/immersion-exam/latest');
  return data.data;
};

export const getImmersionExamResults = async () => {
  const exam = await getImmersionExam();
  const week = exam?.current?.week;
  if (!week) return [];
  const { data } = await api.get(`/trainer/immersion-exam/${week}/results`);
  return data.data;
};

export const getImmersionExamResultsByWeek = async (week = 1) => {
  const { data } = await api.get(`/trainer/immersion-exam/${week}/results`);
  return data.data;
};

export const getStudentById = async (id) => {
  const { data } = await api.get(`/trainer/students/${id}`);
  return data.data;
};

export const getTrainerDashboard = async () => {
  const [overviewRes, trendRes, topRes, atRiskRes, insightsRes, examRes] = await Promise.all([
    getTrainerOverview(),
    getActivityTrend(),
    getTopPerformers(),
    getAtRiskStudents(),
    getInsights(),
    getImmersionExam(),
  ]);
  return {
    profile:            overviewRes.profile,
    overview:           overviewRes.overview,
    trend:              trendRes,
    topPerformers:      topRes,
    atRisk:             atRiskRes,
    insights:           insightsRes,
    immersionExam:      examRes,
    immersionExamResults: [],
  };
};
