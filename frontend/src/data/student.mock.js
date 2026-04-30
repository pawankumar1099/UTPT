// Hardcoded mock data shaped exactly like the future MongoDB documents.
// When the backend is ready, services will replace these with HTTP calls
// — components and hooks won't need to change.

export const studentProfile = {
  _id: '65f1c9e8a7b3c2d4e5f60001',
  name: 'Pawan Kumar',
  email: 'pawan.kumar@utpt.edu',
  role: 'student',
  batch: '2026',
  branch: 'CSE',
  specialization: 'AI/ML',
  avatarUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
  joinedAt: '2024-08-12T00:00:00.000Z',
};

export const codingStats = {
  totalSolved: 1250,
  easy: { solved: 450, total: 800, percentage: 36 },
  medium: { solved: 650, total: 1500, percentage: 52 },
  hard: { solved: 150, total: 700, percentage: 12 },
  currentStreak: 12,
  longestStreak: 34,
  totalCommits: 320,
  rank: 23,
  ranking: { batch: 4, branch: 7, specialization: 2 },
};

export const problemsOverTime = [
  { date: '1 May', solved: 30 },
  { date: '8 May', solved: 60 },
  { date: '15 May', solved: 105 },
  { date: '22 May', solved: 145 },
  { date: '29 May', solved: 180 },
];

export const githubActivity = {
  totalCommits: 320,
  repositories: 8,
  status: 'Active',
  username: 'pawan-utpt',
  // 7 rows (days of week) x 26 cols (~6 months) heatmap intensities 0..4
  heatmap: Array.from({ length: 7 }, () =>
    Array.from({ length: 26 }, () => Math.floor(Math.random() * 5)),
  ),
  months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
  recentRepos: [
    {
      _id: 'r1',
      name: 'DSA-Visualizer',
      status: 'Active',
      updatedAt: '2026-04-28T00:00:00.000Z',
    },
    { _id: 'r2', name: 'Web-Portfolio', status: 'Active', updatedAt: '2026-04-25T00:00:00.000Z' },
    { _id: 'r3', name: 'UTPT-Project', status: 'Inactive', updatedAt: '2026-04-15T00:00:00.000Z' },
  ],
};

export const recentActivity = [
  {
    _id: 'a1',
    type: 'solve',
    text: 'Solved 3 Medium problems on LeetCode',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'a2',
    type: 'commit',
    text: 'Pushed 2 commits to DSA-Visualizer',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'a3',
    type: 'rank',
    text: 'Moved up 5 ranks on the leaderboard',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'a4',
    type: 'solve',
    text: 'Solved 1 Hard problem on Codeforces',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'a5',
    type: 'streak',
    text: 'Maintained 10 day streak',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const leaderboardSnapshot = {
  top: [
    {
      _id: 'u2',
      rank: 2,
      name: 'Riya Singh',
      score: 2120,
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
    },
    {
      _id: 'u1',
      rank: 1,
      name: 'Aman Verma',
      score: 2350,
      avatarUrl:
        'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&crop=faces',
    },
    {
      _id: 'u3',
      rank: 3,
      name: 'Soumya R.',
      score: 1980,
      avatarUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
    },
  ],
  you: { _id: 'me', rank: 23, name: 'Pawan Kumar', score: 1250 },
};

// ── Coding Progress Page ──────────────────────────────────────────────────────
// Per-platform data shaped like future MongoDB aggregations.
// Swap simulate() → api.get('/student/coding-progress?platform=all') etc.

const makeCalendar = (seed) => {
  // 5 rows (Mon/Wed/Fri/Sat/Sun) × 20 cols (~5 months)
  const rng = (i) => Math.abs(Math.sin(seed + i * 7919)) % 1;
  return Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 20 }, (_, c) => Math.floor(rng(r * 20 + c) * 5)),
  );
};

export const codingProgress = {
  all: {
    stats: {
      totalSolved: 532,
      easy: { solved: 218, total: 600, percentage: 41 },
      medium: { solved: 247, total: 600, percentage: 46 },
      hard: { solved: 67, total: 300, percentage: 13 },
      globalRanking: 12842,
      globalRankingChange: 2153,
      acceptanceRate: 78.6,
      totalSubmissions: 1256,
      contestsParticipated: 23,
      contestRating: 1842,
    },
    currentStreak: 14,
    longestStreak: 28,
    longestStreakRange: '12 Jan – 8 Feb 2024',
    problemsOverTime: [
      { date: 'Apr 1',  easy: 60,  medium: 70,  hard: 20, total: 150 },
      { date: 'Apr 8',  easy: 90,  medium: 110, hard: 28, total: 228 },
      { date: 'Apr 15', easy: 120, medium: 150, hard: 38, total: 308 },
      { date: 'Apr 22', easy: 160, medium: 200, hard: 52, total: 412 },
      { date: 'Apr 29', easy: 218, medium: 247, hard: 67, total: 532 },
    ],
    calendarMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    calendarDays: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
    submissionCalendar: makeCalendar(1),
    recentSubmissions: [
      { _id: 's1', problem: 'Two Sum', difficulty: 'Easy', status: 'Accepted', language: 'Python', submittedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
      { _id: 's2', problem: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', status: 'Accepted', language: 'JavaScript', submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
      { _id: 's3', problem: 'Median of Two Sorted Arrays', difficulty: 'Hard', status: 'Accepted', language: 'C++', submittedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
      { _id: 's4', problem: 'Valid Parentheses', difficulty: 'Easy', status: 'Accepted', language: 'Python', submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { _id: 's5', problem: 'Merge k Sorted Lists', difficulty: 'Hard', status: 'Wrong Answer', language: 'Java', submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    ],
  },
  leetcode: {
    stats: {
      totalSolved: 365,
      easy: { solved: 152, total: 400, percentage: 42 },
      medium: { solved: 178, total: 450, percentage: 49 },
      hard: { solved: 35, total: 200, percentage: 9 },
      globalRanking: 12842,
      globalRankingChange: 2153,
      acceptanceRate: 81.2,
      totalSubmissions: 890,
      contestsParticipated: 18,
      contestRating: 1842,
    },
    currentStreak: 14,
    longestStreak: 28,
    longestStreakRange: '12 Jan – 8 Feb 2024',
    problemsOverTime: [
      { date: 'Apr 1',  easy: 42,  medium: 50,  hard: 12, total: 104 },
      { date: 'Apr 8',  easy: 68,  medium: 80,  hard: 16, total: 164 },
      { date: 'Apr 15', easy: 92,  medium: 115, hard: 22, total: 229 },
      { date: 'Apr 22', easy: 120, medium: 148, hard: 29, total: 297 },
      { date: 'Apr 29', easy: 152, medium: 178, hard: 35, total: 365 },
    ],
    calendarMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    calendarDays: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
    submissionCalendar: makeCalendar(2),
    recentSubmissions: [
      { _id: 'l1', problem: 'Two Sum', difficulty: 'Easy', status: 'Accepted', language: 'Python', submittedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
      { _id: 'l2', problem: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', status: 'Accepted', language: 'JavaScript', submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
      { _id: 'l3', problem: 'Valid Parentheses', difficulty: 'Easy', status: 'Accepted', language: 'Python', submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { _id: 'l4', problem: 'Merge k Sorted Lists', difficulty: 'Hard', status: 'Wrong Answer', language: 'Java', submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    ],
  },
  codeforces: {
    stats: {
      totalSolved: 167,
      easy: { solved: 66, total: 200, percentage: 40 },
      medium: { solved: 69, total: 150, percentage: 41 },
      hard: { solved: 32, total: 100, percentage: 19 },
      globalRanking: 48210,
      globalRankingChange: 890,
      acceptanceRate: 73.4,
      totalSubmissions: 366,
      contestsParticipated: 5,
      contestRating: 1420,
    },
    currentStreak: 6,
    longestStreak: 14,
    longestStreakRange: '3 Mar – 17 Mar 2024',
    problemsOverTime: [
      { date: 'Apr 1',  easy: 18, medium: 20, hard: 8,  total: 46 },
      { date: 'Apr 8',  easy: 28, medium: 32, hard: 13, total: 73 },
      { date: 'Apr 15', easy: 40, medium: 46, hard: 18, total: 104 },
      { date: 'Apr 22', easy: 52, medium: 58, hard: 26, total: 136 },
      { date: 'Apr 29', easy: 66, medium: 69, hard: 32, total: 167 },
    ],
    calendarMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    calendarDays: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
    submissionCalendar: makeCalendar(3),
    recentSubmissions: [
      { _id: 'c1', problem: 'Watermelon', difficulty: 'Easy', status: 'Accepted', language: 'C++', submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { _id: 'c2', problem: 'Theatre Square', difficulty: 'Easy', status: 'Accepted', language: 'Python', submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { _id: 'c3', problem: 'Lights Out', difficulty: 'Medium', status: 'Time Limit Exceeded', language: 'C++', submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      { _id: 'c4', problem: 'Dijkstra?', difficulty: 'Hard', status: 'Accepted', language: 'C++', submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    ],
  },
};

export const notifications = [
  {
    _id: 'n1',
    type: 'warning',
    title: 'Your coding activity is lower this week.',
    body: 'Try to solve more problems!',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    _id: 'n2',
    type: 'info',
    title: 'Great! You maintained your 12 day streak.',
    body: 'Keep it going!',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    _id: 'n3',
    type: 'success',
    title: 'You moved up 5 ranks in the leaderboard.',
    body: 'Keep coding to improve more!',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];
