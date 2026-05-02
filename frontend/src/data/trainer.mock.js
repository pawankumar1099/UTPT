// Trainer dashboard mock data — shaped like future MongoDB documents.
// When the backend is ready, trainer.service.js will replace simulate() calls
// with api.get('/trainer/...') — components won't need to change.

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
];

export const trainerProfile = {
  _id: 'trainer_001',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@utpt.edu',
  role: 'trainer',
  batch: '2026',
  branch: 'CSE',
  avatarUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
};

// 120 students — shapes exactly what a future /trainer/students endpoint returns.
const names = [
  'Aman Verma', 'Priya Singh', 'Rohit Kumar', 'Sneha Patel', 'Vikash Yadav',
  'Neha Gupta', 'Arjun Das', 'Pooja Sharma', 'Sahil Khan', 'Tanvi Joshi',
  'Dev Sharma', 'Meera Nair', 'Ankit Raj', 'Karan Mehta', 'Riya Bhatt',
  'Saurabh Tiwari', 'Anjali Mishra', 'Nikhil Agarwal', 'Swati Verma', 'Rajeev Nair',
  'Ishaan Chaudhary', 'Divya Soni', 'Manish Pandey', 'Preeti Yadav', 'Akash Gupta',
  'Simran Kaur', 'Amit Sharma', 'Nisha Kumari', 'Varun Singh', 'Ayesha Khan',
];

function daysAgo(n) {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function buildStudent(i) {
  const nameIdx = i % names.length;
  const avatarIdx = i % AVATARS.length;
  const isTopPerformer = i < 5;
  const isAtRisk = i >= 20 && i < 30;
  const inactiveDays = isAtRisk ? 5 + Math.floor((i - 20) * 0.8) : isTopPerformer ? 0 : Math.floor(i * 0.3) % 3;
  const active = inactiveDays <= 2;

  const base = isTopPerformer
    ? { problems: 100 + i * 12, streak: 20 + i * 2, commits: 40 + i * 4, score: 2000 + i * 90, growth: 10 + i * 2 }
    : isAtRisk
    ? { problems: 20 + (i - 20) * 3, streak: 1 + (i - 20) % 4, commits: 5 + (i - 20) * 2, score: 400 + (i - 20) * 50, growth: -5 - (i - 20) }
    : { problems: 50 + i * 3, streak: 5 + i % 18, commits: 15 + i * 2, score: 800 + i * 40, growth: 3 + i % 12 };

  return {
    _id: `student_${String(i + 1).padStart(3, '0')}`,
    name: `${names[nameIdx]} ${i >= names.length ? String(Math.floor(i / names.length) + 1) : ''}`.trim(),
    email: `${names[nameIdx].toLowerCase().replace(' ', '.')}${i >= names.length ? i : ''}@utpt.edu`,
    avatarUrl: AVATARS[avatarIdx],
    batch: '2026',
    branch: i % 3 === 0 ? 'ECE' : i % 4 === 0 ? 'IT' : 'CSE',
    problemsSolved: base.problems,
    streak: base.streak,
    githubCommits: base.commits,
    score: base.score,
    growth: base.growth,
    status: active ? 'Active' : 'Inactive',
    lastActive: daysAgo(inactiveDays),
    inactiveDays,
    isAtRisk,
    riskReason: isAtRisk
      ? ['Low activity', 'No submissions recently', 'Low streak', 'Low problems solved', 'Low score'][
          (i - 20) % 5
        ]
      : null,
    codingStats: {
      totalSolved: base.problems,
      easy: { solved: Math.round(base.problems * 0.4), total: 600 },
      medium: { solved: Math.round(base.problems * 0.45), total: 600 },
      hard: { solved: Math.round(base.problems * 0.15), total: 300 },
    },
    recentActivity: [
      { type: 'solve', text: `Solved ${2 + (i % 4)} problems on LeetCode`, date: daysAgo(inactiveDays) },
      { type: 'commit', text: `Pushed ${1 + (i % 3)} commits to project`, date: daysAgo(inactiveDays + 1) },
    ],
  };
}

export const allStudents = Array.from({ length: 120 }, (_, i) => buildStudent(i));

// ── Overview stats ────────────────────────────────────────────────────────────
// Future: api.get('/trainer/overview')
export const trainerOverview = {
  totalStudents: 120,
  totalStudentsChange: 8,
  activeStudents: 85,
  activeStudentsChange: 12,
  inactiveStudents: 35,
  inactiveStudentsChange: -5,
  avgProblemsSolved: 36.4,
  avgProblemsSolvedChange: 6.3,
  avgStreak: 14.2,
  avgStreakChange: 2.1,
};

// ── Activity trend (last 7 days) ──────────────────────────────────────────────
// Future: api.get('/trainer/activity-trend?days=7')
export const activityTrend = [
  { date: 'May 15', avgProblems: 28, totalActivity: 210 },
  { date: 'May 16', avgProblems: 35, totalActivity: 285 },
  { date: 'May 17', avgProblems: 30, totalActivity: 260 },
  { date: 'May 18', avgProblems: 45, totalActivity: 370 },
  { date: 'May 19', avgProblems: 40, totalActivity: 320 },
  { date: 'May 20', avgProblems: 42, totalActivity: 355 },
  { date: 'May 21', avgProblems: 50, totalActivity: 420 },
];

// ── Top 5 performers ──────────────────────────────────────────────────────────
// Future: api.get('/trainer/top-performers?limit=5')
export const topPerformers = allStudents.slice(0, 5).map((s, i) => ({
  ...s,
  rank: i + 1,
  medal: ['🥇', '🥈', '🥉', '4', '5'][i],
}));

// ── At-risk students ──────────────────────────────────────────────────────────
// Future: api.get('/trainer/at-risk?limit=5')
export const atRiskStudents = allStudents.filter((s) => s.isAtRisk).slice(0, 5);

// ── Immersion Exam ────────────────────────────────────────────────────────────
// Weekly in-college exam. Future: api.get('/trainer/immersion-exam/latest')

export const immersionExam = {
  current: {
    week: 12,
    date: '2024-05-18T09:00:00.000Z',
    duration: 90,
    totalStudents: 120,
    appeared: 108,
    passed: 87,
    avgScore: 68.4,
    avgScoreChange: 4.2,
    highestScore: 98,
    lowestScore: 22,
    passPercent: 80.6,
    topScorers: [
      { _id: allStudents[0]._id, name: allStudents[0].name, avatarUrl: allStudents[0].avatarUrl, score: 98, rank: 1 },
      { _id: allStudents[2]._id, name: allStudents[2].name, avatarUrl: allStudents[2].avatarUrl, score: 94, rank: 2 },
      { _id: allStudents[1]._id, name: allStudents[1].name, avatarUrl: allStudents[1].avatarUrl, score: 91, rank: 3 },
    ],
    scoreDistribution: [
      { range: '0–20',  count: 4  },
      { range: '21–40', count: 8  },
      { range: '41–60', count: 22 },
      { range: '61–80', count: 45 },
      { range: '81–100',count: 29 },
    ],
  },
  upcoming: {
    week: 13,
    title: 'Linked Lists & Trees',
    date: '2024-05-25T09:00:00.000Z',
    duration: 90,
  },
  // Last 6 weeks trend — for sparkline
  weeklyTrend: [
    { week: 'Wk 7',  avgScore: 58.1, topic: 'Strings' },
    { week: 'Wk 8',  avgScore: 61.0, topic: 'Sorting' },
    { week: 'Wk 9',  avgScore: 59.4, topic: 'Binary Search' },
    { week: 'Wk 10', avgScore: 63.8, topic: 'Stacks & Queues' },
    { week: 'Wk 11', avgScore: 64.2, topic: 'Recursion' },
    { week: 'Wk 12', avgScore: 68.4, topic: 'Arrays & Hashing' },
  ],
};

// ── Per-student Immersion Exam Results (multi-week) ───────────────────────────
// Future: api.get('/trainer/immersion-exam/:week/results')

const WEAK_TOPICS = ['Arrays', 'Hashing', 'Two Pointers', 'Sliding Window', 'Binary Search'];

export const IMMERSION_WEEKS = [
  { week: 1, label: 'Week 1', topic: 'Introduction to DSA',  date: '2024-02-10T09:00:00.000Z' },
  { week: 2, label: 'Week 2', topic: 'Arrays & Strings',     date: '2024-02-17T09:00:00.000Z' },
  { week: 3, label: 'Week 3', topic: 'Linked Lists',         date: '2024-02-24T09:00:00.000Z' },
  { week: 4, label: 'Week 4', topic: 'Stacks & Queues',      date: '2024-03-02T09:00:00.000Z' },
  { week: 5, label: 'Week 5', topic: 'Sorting Algorithms',   date: '2024-03-09T09:00:00.000Z' },
  { week: 6, label: 'Week 6', topic: 'Binary Search',        date: '2024-03-16T09:00:00.000Z' },
  { week: 7, label: 'Week 7', topic: 'Recursion & Backtrack',date: '2024-03-23T09:00:00.000Z' },
  { week: 8, label: 'Week 8', topic: 'Trees & Graphs',       date: '2024-03-30T09:00:00.000Z' },
];

// Avg score targets per week
const WEEK_AVG = { 1: 52, 2: 55, 3: 57, 4: 58, 5: 61, 6: 63, 7: 65, 8: 68 };

function buildExamResultForWeek(student, i, weekNum) {
  const avgTarget = WEEK_AVG[weekNum] ?? 65;
  const offset = avgTarget - 68; // diff from week-12 baseline

  let marks;
  if (i < 5) {
    const top5 = [98, 94, 91, 87, 85];
    marks = Math.max(40, Math.min(100, top5[i] + offset));
  } else if (i >= 20 && i < 30) {
    const atRisk = [38, 22, 31, 15, 29, 42, 18, 35, 27, 33];
    marks = Math.max(5, Math.min(60, atRisk[i - 20] + offset));
  } else {
    // deterministic per (student, week)
    const seed = (i * 17 + weekNum * 31 + 7) % 45;
    marks = Math.max(20, Math.min(100, 45 + seed + offset));
  }

  const status = marks >= 40 ? 'Pass' : 'Fail';
  const grade  = marks >= 75 ? 'Good' : marks >= 50 ? 'Average' : 'Poor';
  const weakArea = marks < 75 ? WEAK_TOPICS[(i + weekNum) % WEAK_TOPICS.length] : null;
  return {
    _id: student._id,
    name: student.name,
    avatarUrl: student.avatarUrl,
    branch: student.branch,
    marks,
    status,
    grade,
    weakArea,
  };
}

function buildWeekResults(weekNum) {
  return allStudents
    .slice(0, 108)
    .map((s, i) => buildExamResultForWeek(s, i, weekNum))
    .sort((a, b) => b.marks - a.marks)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export const immersionExamResults = buildWeekResults(8);

export const immersionExamResultsByWeek = {
  1: buildWeekResults(1),
  2: buildWeekResults(2),
  3: buildWeekResults(3),
  4: buildWeekResults(4),
  5: buildWeekResults(5),
  6: buildWeekResults(6),
  7: buildWeekResults(7),
  8: immersionExamResults,
};

// ── Insights ─────────────────────────────────────────────────────────────────
// Future: api.get('/trainer/insights') — server-computed alerts
export const insights = [
  { type: 'warning', text: '15 students are inactive this week.' },
  { type: 'positive', text: 'Average problems solved increased by 6.3%.' },
  { type: 'positive', text: 'Top performer Aman Verma improved by 18%.' },
  { type: 'warning', text: '5 students haven\'t submitted in 7+ days.' },
  { type: 'info', text: 'Avg streak dropped by 2 days compared to last week.' },
];
