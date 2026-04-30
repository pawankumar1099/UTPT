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
