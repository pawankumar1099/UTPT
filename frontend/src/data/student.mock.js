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

// ── Leaderboard Page ──────────────────────────────────────────────────────────
// Per-platform, per-timeframe. Future: api.get('/leaderboard?platform=leetcode&time=weekly')

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

function mkBoard(rows, you) {
  return { rows, you };
}

const weeklyLeetcode = mkBoard([
  { _id: 'u1', rank: 1, name: 'Pawan Kumar',  batch: '2026', branch: 'CSE', leetcodeScore: 1250, githubScore: 450, totalScore: 1700, avatarUrl: AVATARS[0], isMe: true },
  { _id: 'u2', rank: 2, name: 'Ankit Raj',    batch: '2026', branch: 'CSE', leetcodeScore: 1100, githubScore: 420, totalScore: 1520, avatarUrl: AVATARS[1] },
  { _id: 'u3', rank: 3, name: 'Sneha Singh',  batch: '2026', branch: 'ECE', leetcodeScore: 950,  githubScore: 380, totalScore: 1330, avatarUrl: AVATARS[2] },
  { _id: 'u4', rank: 4, name: 'Rohit Verma',  batch: '2025', branch: 'CSE', leetcodeScore: 850,  githubScore: 310, totalScore: 1160, avatarUrl: AVATARS[3] },
  { _id: 'u5', rank: 5, name: 'Kartik Gupta', batch: '2026', branch: 'IT',  leetcodeScore: 780,  githubScore: 290, totalScore: 1070, avatarUrl: AVATARS[4] },
  { _id: 'u6', rank: 6, name: 'Meera Nair',   batch: '2025', branch: 'CSE', leetcodeScore: 720,  githubScore: 270, totalScore: 990,  avatarUrl: AVATARS[5] },
  { _id: 'u7', rank: 7, name: 'Dev Sharma',   batch: '2027', branch: 'ECE', leetcodeScore: 680,  githubScore: 250, totalScore: 930,  avatarUrl: AVATARS[6] },
  { _id: 'u8', rank: 8, name: 'Priya Patel',  batch: '2026', branch: 'CSE', leetcodeScore: 640,  githubScore: 230, totalScore: 870,  avatarUrl: AVATARS[7] },
  { _id: 'u9', rank: 9, name: 'Arjun Mehta',  batch: '2027', branch: 'IT',  leetcodeScore: 600,  githubScore: 210, totalScore: 810,  avatarUrl: AVATARS[8] },
  { _id: 'u10',rank: 10,name: 'Tanvi Joshi',  batch: '2025', branch: 'CSE', leetcodeScore: 560,  githubScore: 195, totalScore: 755,  avatarUrl: AVATARS[9] },
], { _id: 'me', rank: 23, name: 'Pawan Kumar', leetcodeScore: 520, githubScore: 180, totalScore: 700, avatarUrl: AVATARS[0], isMe: true });

const monthlyLeetcode = mkBoard([
  { _id: 'u2', rank: 1, name: 'Ankit Raj',    batch: '2026', branch: 'CSE', leetcodeScore: 4200, githubScore: 1600, totalScore: 5800, avatarUrl: AVATARS[1] },
  { _id: 'u1', rank: 2, name: 'Pawan Kumar',  batch: '2026', branch: 'CSE', leetcodeScore: 3900, githubScore: 1450, totalScore: 5350, avatarUrl: AVATARS[0], isMe: true },
  { _id: 'u5', rank: 3, name: 'Kartik Gupta', batch: '2026', branch: 'IT',  leetcodeScore: 3600, githubScore: 1200, totalScore: 4800, avatarUrl: AVATARS[4] },
  { _id: 'u3', rank: 4, name: 'Sneha Singh',  batch: '2026', branch: 'ECE', leetcodeScore: 3200, githubScore: 1100, totalScore: 4300, avatarUrl: AVATARS[2] },
  { _id: 'u7', rank: 5, name: 'Dev Sharma',   batch: '2027', branch: 'ECE', leetcodeScore: 2900, githubScore: 980,  totalScore: 3880, avatarUrl: AVATARS[6] },
  { _id: 'u4', rank: 6, name: 'Rohit Verma',  batch: '2025', branch: 'CSE', leetcodeScore: 2600, githubScore: 890,  totalScore: 3490, avatarUrl: AVATARS[3] },
  { _id: 'u8', rank: 7, name: 'Priya Patel',  batch: '2026', branch: 'CSE', leetcodeScore: 2300, githubScore: 800,  totalScore: 3100, avatarUrl: AVATARS[7] },
  { _id: 'u6', rank: 8, name: 'Meera Nair',   batch: '2025', branch: 'CSE', leetcodeScore: 2100, githubScore: 720,  totalScore: 2820, avatarUrl: AVATARS[5] },
  { _id: 'u9', rank: 9, name: 'Arjun Mehta',  batch: '2027', branch: 'IT',  leetcodeScore: 1900, githubScore: 650,  totalScore: 2550, avatarUrl: AVATARS[8] },
  { _id: 'u10',rank: 10,name: 'Tanvi Joshi',  batch: '2025', branch: 'CSE', leetcodeScore: 1700, githubScore: 580,  totalScore: 2280, avatarUrl: AVATARS[9] },
], { _id: 'me', rank: 2, name: 'Pawan Kumar', leetcodeScore: 3900, githubScore: 1450, totalScore: 5350, avatarUrl: AVATARS[0], isMe: true });

const weeklyGithub = mkBoard([
  { _id: 'u6', rank: 1, name: 'Meera Nair',   batch: '2025', branch: 'CSE', leetcodeScore: 420,  githubScore: 980,  totalScore: 1400, avatarUrl: AVATARS[5] },
  { _id: 'u3', rank: 2, name: 'Sneha Singh',  batch: '2026', branch: 'ECE', leetcodeScore: 380,  githubScore: 860,  totalScore: 1240, avatarUrl: AVATARS[2] },
  { _id: 'u9', rank: 3, name: 'Arjun Mehta',  batch: '2027', branch: 'IT',  leetcodeScore: 290,  githubScore: 810,  totalScore: 1100, avatarUrl: AVATARS[8] },
  { _id: 'u1', rank: 4, name: 'Pawan Kumar',  batch: '2026', branch: 'CSE', leetcodeScore: 520,  githubScore: 750,  totalScore: 1270, avatarUrl: AVATARS[0], isMe: true },
  { _id: 'u7', rank: 5, name: 'Dev Sharma',   batch: '2027', branch: 'ECE', leetcodeScore: 310,  githubScore: 720,  totalScore: 1030, avatarUrl: AVATARS[6] },
  { _id: 'u2', rank: 6, name: 'Ankit Raj',    batch: '2026', branch: 'CSE', leetcodeScore: 480,  githubScore: 680,  totalScore: 1160, avatarUrl: AVATARS[1] },
  { _id: 'u8', rank: 7, name: 'Priya Patel',  batch: '2026', branch: 'CSE', leetcodeScore: 260,  githubScore: 640,  totalScore: 900,  avatarUrl: AVATARS[7] },
  { _id: 'u4', rank: 8, name: 'Rohit Verma',  batch: '2025', branch: 'CSE', leetcodeScore: 340,  githubScore: 600,  totalScore: 940,  avatarUrl: AVATARS[3] },
  { _id: 'u5', rank: 9, name: 'Kartik Gupta', batch: '2026', branch: 'IT',  leetcodeScore: 290,  githubScore: 560,  totalScore: 850,  avatarUrl: AVATARS[4] },
  { _id: 'u10',rank: 10,name: 'Tanvi Joshi',  batch: '2025', branch: 'CSE', leetcodeScore: 220,  githubScore: 510,  totalScore: 730,  avatarUrl: AVATARS[9] },
], { _id: 'me', rank: 4, name: 'Pawan Kumar', leetcodeScore: 520, githubScore: 750, totalScore: 1270, avatarUrl: AVATARS[0], isMe: true });

const monthlyGithub = mkBoard([
  { _id: 'u9', rank: 1, name: 'Arjun Mehta',  batch: '2027', branch: 'IT',  leetcodeScore: 1100, githubScore: 3400, totalScore: 4500, avatarUrl: AVATARS[8] },
  { _id: 'u6', rank: 2, name: 'Meera Nair',   batch: '2025', branch: 'CSE', leetcodeScore: 1300, githubScore: 3100, totalScore: 4400, avatarUrl: AVATARS[5] },
  { _id: 'u1', rank: 3, name: 'Pawan Kumar',  batch: '2026', branch: 'CSE', leetcodeScore: 1800, githubScore: 2800, totalScore: 4600, avatarUrl: AVATARS[0], isMe: true },
  { _id: 'u3', rank: 4, name: 'Sneha Singh',  batch: '2026', branch: 'ECE', leetcodeScore: 1200, githubScore: 2600, totalScore: 3800, avatarUrl: AVATARS[2] },
  { _id: 'u7', rank: 5, name: 'Dev Sharma',   batch: '2027', branch: 'ECE', leetcodeScore: 1000, githubScore: 2400, totalScore: 3400, avatarUrl: AVATARS[6] },
  { _id: 'u2', rank: 6, name: 'Ankit Raj',    batch: '2026', branch: 'CSE', leetcodeScore: 1600, githubScore: 2200, totalScore: 3800, avatarUrl: AVATARS[1] },
  { _id: 'u5', rank: 7, name: 'Kartik Gupta', batch: '2026', branch: 'IT',  leetcodeScore: 1100, githubScore: 2100, totalScore: 3200, avatarUrl: AVATARS[4] },
  { _id: 'u4', rank: 8, name: 'Rohit Verma',  batch: '2025', branch: 'CSE', leetcodeScore: 1200, githubScore: 1900, totalScore: 3100, avatarUrl: AVATARS[3] },
  { _id: 'u8', rank: 9, name: 'Priya Patel',  batch: '2026', branch: 'CSE', leetcodeScore: 950,  githubScore: 1800, totalScore: 2750, avatarUrl: AVATARS[7] },
  { _id: 'u10',rank: 10,name: 'Tanvi Joshi',  batch: '2025', branch: 'CSE', leetcodeScore: 820,  githubScore: 1650, totalScore: 2470, avatarUrl: AVATARS[9] },
], { _id: 'me', rank: 3, name: 'Pawan Kumar', leetcodeScore: 1800, githubScore: 2800, totalScore: 4600, avatarUrl: AVATARS[0], isMe: true });

const weeklyCombined = mkBoard([
  { _id: 'u2', rank: 1, name: 'Ankit Raj',    batch: '2026', branch: 'CSE', leetcodeScore: 1100, githubScore: 680,  totalScore: 1780, avatarUrl: AVATARS[1] },
  { _id: 'u1', rank: 2, name: 'Pawan Kumar',  batch: '2026', branch: 'CSE', leetcodeScore: 1250, githubScore: 450,  totalScore: 1700, avatarUrl: AVATARS[0], isMe: true },
  { _id: 'u3', rank: 3, name: 'Sneha Singh',  batch: '2026', branch: 'ECE', leetcodeScore: 950,  githubScore: 380,  totalScore: 1330, avatarUrl: AVATARS[2] },
  { _id: 'u6', rank: 4, name: 'Meera Nair',   batch: '2025', branch: 'CSE', leetcodeScore: 720,  githubScore: 560,  totalScore: 1280, avatarUrl: AVATARS[5] },
  { _id: 'u4', rank: 5, name: 'Rohit Verma',  batch: '2025', branch: 'CSE', leetcodeScore: 850,  githubScore: 310,  totalScore: 1160, avatarUrl: AVATARS[3] },
  { _id: 'u5', rank: 6, name: 'Kartik Gupta', batch: '2026', branch: 'IT',  leetcodeScore: 780,  githubScore: 290,  totalScore: 1070, avatarUrl: AVATARS[4] },
  { _id: 'u9', rank: 7, name: 'Arjun Mehta',  batch: '2027', branch: 'IT',  leetcodeScore: 600,  githubScore: 450,  totalScore: 1050, avatarUrl: AVATARS[8] },
  { _id: 'u7', rank: 8, name: 'Dev Sharma',   batch: '2027', branch: 'ECE', leetcodeScore: 680,  githubScore: 340,  totalScore: 1020, avatarUrl: AVATARS[6] },
  { _id: 'u8', rank: 9, name: 'Priya Patel',  batch: '2026', branch: 'CSE', leetcodeScore: 640,  githubScore: 300,  totalScore: 940,  avatarUrl: AVATARS[7] },
  { _id: 'u10',rank: 10,name: 'Tanvi Joshi',  batch: '2025', branch: 'CSE', leetcodeScore: 560,  githubScore: 280,  totalScore: 840,  avatarUrl: AVATARS[9] },
], { _id: 'me', rank: 2, name: 'Pawan Kumar', leetcodeScore: 1250, githubScore: 450, totalScore: 1700, avatarUrl: AVATARS[0], isMe: true });

const monthlyCombined = mkBoard([
  { _id: 'u2', rank: 1, name: 'Ankit Raj',    batch: '2026', branch: 'CSE', leetcodeScore: 4200, githubScore: 2200, totalScore: 6400, avatarUrl: AVATARS[1] },
  { _id: 'u9', rank: 2, name: 'Arjun Mehta',  batch: '2027', branch: 'IT',  leetcodeScore: 1900, githubScore: 3400, totalScore: 5300, avatarUrl: AVATARS[8] },
  { _id: 'u1', rank: 3, name: 'Pawan Kumar',  batch: '2026', branch: 'CSE', leetcodeScore: 3900, githubScore: 1450, totalScore: 5350, avatarUrl: AVATARS[0], isMe: true },
  { _id: 'u5', rank: 4, name: 'Kartik Gupta', batch: '2026', branch: 'IT',  leetcodeScore: 3600, githubScore: 1200, totalScore: 4800, avatarUrl: AVATARS[4] },
  { _id: 'u6', rank: 5, name: 'Meera Nair',   batch: '2025', branch: 'CSE', leetcodeScore: 2100, githubScore: 2300, totalScore: 4400, avatarUrl: AVATARS[5] },
  { _id: 'u3', rank: 6, name: 'Sneha Singh',  batch: '2026', branch: 'ECE', leetcodeScore: 3200, githubScore: 1100, totalScore: 4300, avatarUrl: AVATARS[2] },
  { _id: 'u7', rank: 7, name: 'Dev Sharma',   batch: '2027', branch: 'ECE', leetcodeScore: 2900, githubScore: 1200, totalScore: 4100, avatarUrl: AVATARS[6] },
  { _id: 'u4', rank: 8, name: 'Rohit Verma',  batch: '2025', branch: 'CSE', leetcodeScore: 2600, githubScore: 1100, totalScore: 3700, avatarUrl: AVATARS[3] },
  { _id: 'u8', rank: 9, name: 'Priya Patel',  batch: '2026', branch: 'CSE', leetcodeScore: 2300, githubScore: 900,  totalScore: 3200, avatarUrl: AVATARS[7] },
  { _id: 'u10',rank: 10,name: 'Tanvi Joshi',  batch: '2025', branch: 'CSE', leetcodeScore: 1700, githubScore: 780,  totalScore: 2480, avatarUrl: AVATARS[9] },
], { _id: 'me', rank: 3, name: 'Pawan Kumar', leetcodeScore: 3900, githubScore: 1450, totalScore: 5350, avatarUrl: AVATARS[0], isMe: true });

export const leaderboardData = {
  leetcode: { weekly: weeklyLeetcode, monthly: monthlyLeetcode },
  github:   { weekly: weeklyGithub,   monthly: monthlyGithub   },
  combined: { weekly: weeklyCombined, monthly: monthlyCombined },
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
