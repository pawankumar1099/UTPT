# UTPT — MERN Backend Documentation

Complete reference for building the Node.js / Express / MongoDB backend that powers the UTPT student & trainer dashboard. Every section maps directly to what the existing React frontend already consumes.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Environment Variables](#3-environment-variables)
4. [Database — Collections & Schemas](#4-database--collections--schemas)
   - 4.1 users
   - 4.2 coding_stats
   - 4.3 github_stats
   - 4.4 leaderboard_snapshots
   - 4.5 immersion_exams
   - 4.6 immersion_results
   - 4.7 activity_logs
   - 4.8 notifications
5. [External API Integrations](#5-external-api-integrations)
   - 5.1 LeetCode (GraphQL)
   - 5.2 GitHub REST API
   - 5.3 Codeforces API
6. [Score Computation Logic](#6-score-computation-logic)
7. [Cron Jobs — Sync Strategy](#7-cron-jobs--sync-strategy)
8. [Authentication & Middleware](#8-authentication--middleware)
9. [API Endpoints — Student](#9-api-endpoints--student)
10. [API Endpoints — Trainer](#10-api-endpoints--trainer)
11. [API Endpoints — Shared / Leaderboard](#11-api-endpoints--shared--leaderboard)
12. [Controllers Reference](#12-controllers-reference)
13. [Utilities Reference](#13-utilities-reference)
14. [MongoDB Indexes](#14-mongodb-indexes)
15. [Error Handling Convention](#15-error-handling-convention)

---

## 1. Architecture Overview

```
React Frontend (Vite)
       │  HTTP/JSON  (axios, base URL = /api)
       ▼
Express Server  ──► MongoDB Atlas (single DB: utpt_db)
       │
       ├── JWT Auth middleware (student | trainer roles)
       ├── Route groups: /api/auth, /api/student, /api/trainer, /api/leaderboard
       │
       ├── LeetCode GraphQL API   ─┐
       ├── GitHub REST API         ├── fetched by cron, cached in MongoDB
       └── Codeforces REST API    ─┘
```

**One database, eight collections.** No microservices. Everything in one Express app.

- **Runtime:** Node.js 20+
- **Framework:** Express 4
- **Database:** MongoDB (via Mongoose 8)
- **Auth:** JWT (access token 7d) + bcrypt
- **Scheduler:** node-cron (sync external APIs on a schedule)
- **HTTP client (server-side):** axios

---

## 2. Folder Structure

```
backend/
├── server.js                  # Entry point — creates Express app, connects DB, starts cron
├── app.js                     # Express app setup (middleware, routes, error handler)
│
├── config/
│   ├── db.js                  # Mongoose connect()
│   └── env.js                 # Validates & exports all env variables
│
├── models/
│   ├── User.js
│   ├── CodingStat.js
│   ├── GithubStat.js
│   ├── LeaderboardSnapshot.js
│   ├── ImmersionExam.js
│   ├── ImmersionResult.js
│   ├── ActivityLog.js
│   └── Notification.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── student.controller.js
│   ├── trainer.controller.js
│   └── leaderboard.controller.js
│
├── routes/
│   ├── auth.routes.js
│   ├── student.routes.js
│   ├── trainer.routes.js
│   └── leaderboard.routes.js
│
├── middleware/
│   ├── auth.middleware.js      # verifyToken — attaches req.user
│   ├── role.middleware.js      # requireRole('student'|'trainer')
│   └── error.middleware.js     # Global error handler
│
├── services/
│   ├── leetcode.service.js     # Fetches from LeetCode GraphQL
│   ├── github.service.js       # Fetches from GitHub REST
│   ├── codeforces.service.js   # Fetches from Codeforces REST
│   └── score.service.js        # Computes scores from raw stats
│
├── jobs/
│   ├── syncCodingStats.job.js  # Cron: fetch LeetCode + Codeforces per user
│   ├── syncGithubStats.job.js  # Cron: fetch GitHub per user
│   └── buildLeaderboard.job.js # Cron: compute & store leaderboard snapshots
│
└── utils/
    ├── asyncHandler.js         # Wraps async route handlers to avoid try/catch
    ├── ApiError.js             # Custom error class with statusCode
    ├── ApiResponse.js          # Standard success response wrapper
    └── paginate.js             # Mongoose pagination helper
```

---

## 3. Environment Variables

Create a `.env` file in `backend/`:

```env
# Server
PORT=5001
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/utpt_db

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

# GitHub API  (create a Personal Access Token with read:user, repo scope)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# LeetCode  (no official API key needed — uses public GraphQL endpoint)
LEETCODE_BASE_URL=https://leetcode.com/graphql

# Codeforces  (optional — uses public API, no auth for read operations)
CODEFORCES_BASE_URL=https://codeforces.com/api

# Cron schedules (cron syntax)
CRON_CODING_SYNC=0 2 * * *       # daily at 2 AM
CRON_GITHUB_SYNC=0 3 * * *       # daily at 3 AM
CRON_LEADERBOARD=0 4 * * *       # daily at 4 AM
```

---

## 4. Database — Collections & Schemas

### 4.1 `users`

Stores both students and trainers. The `role` field distinguishes them.

```js
// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    email:          { type: String, required: true, unique: true, lowercase: true },
    passwordHash:   { type: String, required: true },
    role:           { type: String, enum: ['student', 'trainer'], default: 'student' },

    // Profile
    avatarUrl:      { type: String, default: '' },
    batch:          { type: String },          // e.g. '2026'
    branch:         { type: String },          // 'CSE' | 'ECE' | 'IT'
    specialization: { type: String },          // 'AI/ML' etc.

    // External platform usernames (set during onboarding / profile edit)
    leetcodeUsername:    { type: String, default: '' },
    codeforcesUsername:  { type: String, default: '' },
    githubUsername:      { type: String, default: '' },

    // Trainer-only
    assignedBatch:  { type: String },

    // Status
    isActive:       { type: Boolean, default: true },
    lastActive:     { type: Date, default: Date.now },
    joinedAt:       { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model('User', userSchema);
```

**Document example:**
```json
{
  "_id": "65f1c9e8a7b3c2d4e5f60001",
  "name": "Pawan Kumar",
  "email": "pawan.kumar@utpt.edu",
  "role": "student",
  "batch": "2026",
  "branch": "CSE",
  "specialization": "AI/ML",
  "leetcodeUsername": "pawan_utpt",
  "githubUsername": "pawan-utpt",
  "codeforcesUsername": "pawan_cf",
  "lastActive": "2024-05-21T10:00:00Z",
  "joinedAt": "2024-08-12T00:00:00Z"
}
```

---

### 4.2 `coding_stats`

One document per user. Refreshed by the cron job. Stores the **aggregated totals** fetched from LeetCode and Codeforces.

```js
// models/CodingStat.js
const submissionSchema = new mongoose.Schema(
  {
    problem:     String,
    difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    status:      String,           // 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded'
    language:    String,
    submittedAt: Date,
    platform:    { type: String, enum: ['leetcode', 'codeforces'] },
  },
  { _id: false }
);

const platformStatSchema = new mongoose.Schema(
  {
    totalSolved:         { type: Number, default: 0 },
    easy:                { solved: Number, total: Number, percentage: Number },
    medium:              { solved: Number, total: Number, percentage: Number },
    hard:                { solved: Number, total: Number, percentage: Number },
    globalRanking:       Number,
    globalRankingChange: Number,
    acceptanceRate:      Number,
    totalSubmissions:    Number,
    contestsParticipated:Number,
    contestRating:       Number,
    currentStreak:       { type: Number, default: 0 },
    longestStreak:       { type: Number, default: 0 },
    longestStreakRange:  String,
    recentSubmissions:   [submissionSchema],
  },
  { _id: false }
);

const codingStatSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    leetcode:    platformStatSchema,
    codeforces:  platformStatSchema,

    // Aggregated (all platforms combined) — used by the "all" tab on the coding progress page
    combined: {
      totalSolved:          Number,
      easy:                 { solved: Number, total: Number, percentage: Number },
      medium:               { solved: Number, total: Number, percentage: Number },
      hard:                 { solved: Number, total: Number, percentage: Number },
      acceptanceRate:       Number,
      totalSubmissions:     Number,
      contestsParticipated: Number,
      recentSubmissions:    [submissionSchema],
    },

    // Computed score for leaderboard (see Section 6)
    leetcodeScore:    { type: Number, default: 0 },
    codeforcesScore:  { type: Number, default: 0 },

    // Problems solved over time — stored as snapshots for charts
    // Each entry = total solved count at that date
    problemsOverTime: [
      {
        date:      String,   // 'Apr 1'
        leetcode:  Number,
        codeforces:Number,
        total:     Number,
        _id:       false,
      },
    ],

    // Submission activity calendar — 5 rows × 20 cols (intensity 0-4)
    // Stored as a flat array of 100 integers
    submissionCalendar: {
      leetcode:    [Number],
      codeforces:  [Number],
      combined:    [Number],
    },

    lastSyncedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('CodingStat', codingStatSchema);
```

---

### 4.3 `github_stats`

One document per user. Refreshed by cron.

```js
// models/GithubStat.js
const repoSchema = new mongoose.Schema(
  {
    repoId:     String,        // GitHub repo ID
    name:       String,
    commits:    Number,
    language:   String,
    updatedAt:  Date,
    status:     { type: String, enum: ['Active', 'Inactive'] },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    type:    { type: String, enum: ['push', 'pr', 'fork', 'star'] },
    repo:    String,
    message: String,
    branch:  String,
    ago:     String,           // human-readable, computed at read time
    occurredAt: Date,
  },
  { _id: false }
);

const githubStatSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    totalCommits:         { type: Number, default: 0 },
    totalCommitsChange:   Number,        // vs previous period
    pullRequests:         Number,
    pullRequestsChange:   Number,
    repositories:         Number,
    status:               { type: String, enum: ['Active', 'Inactive'] },

    // Contribution heatmap: 3 rows × 30 cols (intensity 0-4), flat array of 90 integers
    contributionHeatmap:  [Number],
    calendarDays:         [String],      // ['Mon', 'Wed', 'Fri']
    weekLabels:           [String],      // ['Apr 21', 'Apr 28', ...]

    // Commits over time (last 30 days)
    commitsOverTime: [
      { date: String, commits: Number, _id: false },
    ],

    // Computed score for leaderboard
    githubScore:   { type: Number, default: 0 },

    topRepositories: [repoSchema],
    recentEvents:    [eventSchema],

    lastSyncedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('GithubStat', githubStatSchema);
```

---

### 4.4 `leaderboard_snapshots`

Pre-computed rankings, rebuilt nightly by cron. Keeps the leaderboard endpoint fast (no aggregation at read time).

```js
// models/LeaderboardSnapshot.js
const entrySchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:          String,
    avatarUrl:     String,
    batch:         String,
    branch:        String,
    leetcodeScore: Number,
    githubScore:   Number,
    totalScore:    Number,
    rank:          Number,
  },
  { _id: false }
);

const leaderboardSnapshotSchema = new mongoose.Schema(
  {
    platform:  { type: String, enum: ['leetcode', 'github', 'combined'], required: true },
    period:    { type: String, enum: ['weekly', 'monthly'], required: true },
    periodStart: Date,
    periodEnd:   Date,
    entries:   [entrySchema],
    builtAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound unique: one snapshot per platform+period combination
leaderboardSnapshotSchema.index({ platform: 1, period: 1 }, { unique: true });

export default mongoose.model('LeaderboardSnapshot', leaderboardSnapshotSchema);
```

---

### 4.5 `immersion_exams`

One document per exam week — metadata about the exam itself.

```js
// models/ImmersionExam.js
const immersionExamSchema = new mongoose.Schema(
  {
    week:           { type: Number, required: true, unique: true },
    title:          String,              // e.g. 'Trees & Graphs'
    topic:          String,
    date:           Date,                // exam date/time
    duration:       Number,              // minutes
    totalStudents:  Number,
    appeared:       Number,
    passed:         Number,
    avgScore:       Number,
    avgScoreChange: Number,
    highestScore:   Number,
    lowestScore:    Number,
    passPercent:    Number,

    scoreDistribution: [
      {
        range:  String,    // '0–20', '21–40', etc.
        count:  Number,
        _id:    false,
      },
    ],

    topScorers: [
      {
        userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name:      String,
        avatarUrl: String,
        score:     Number,
        rank:      Number,
        _id:       false,
      },
    ],

    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ImmersionExam', immersionExamSchema);
```

---

### 4.6 `immersion_results`

One document per student per week exam result.

```js
// models/ImmersionResult.js
const immersionResultSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week:      { type: Number, required: true },

    marks:     { type: Number, required: true, min: 0, max: 100 },
    status:    { type: String, enum: ['Pass', 'Fail'] },
    grade:     { type: String, enum: ['Good', 'Average', 'Poor'] },
    weakArea:  { type: String, default: null },
    rank:      Number,

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound unique: one result per student per week
immersionResultSchema.index({ userId: 1, week: 1 }, { unique: true });
// Fast query: get all results for a given week, sorted by marks
immersionResultSchema.index({ week: 1, marks: -1 });

export default mongoose.model('ImmersionResult', immersionResultSchema);
```

---

### 4.7 `activity_logs`

Recent activity events for a student — shown in the dashboard feed.

```js
// models/ActivityLog.js
const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:   { type: String, enum: ['solve', 'commit', 'rank', 'streak', 'pr'], required: true },
    text:   { type: String, required: true },
  },
  { timestamps: true }      // createdAt used as the activity time
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
```

---

### 4.8 `notifications`

Per-user notification documents.

```js
// models/Notification.js
const notificationSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:    { type: String, enum: ['rank', 'streak', 'exam', 'alert', 'info'] },
    title:   String,
    message: String,
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
```

---

## 5. External API Integrations

### 5.1 LeetCode (GraphQL)

LeetCode has no official public REST API. Use the **public GraphQL endpoint** at `https://leetcode.com/graphql`. No API key required — just a valid username.

```js
// services/leetcode.service.js
import axios from 'axios';

const BASE = 'https://leetcode.com/graphql';

// Fetch solved counts + submission calendar
export async function fetchLeetCodeStats(username) {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty count submissions
          }
        }
        profile {
          ranking
        }
        submissionCalendar
      }
      allQuestionsCount { difficulty count }
    }
  `;
  const { data } = await axios.post(BASE, { query, variables: { username } });
  return data.data;
}

// Fetch recent accepted submissions
export async function fetchRecentSubmissions(username, limit = 10) {
  const query = `
    query recentSubmissions($username: String!, $limit: Int) {
      recentSubmissionList(username: $username, limit: $limit) {
        title titleSlug status statusDisplay lang timestamp
      }
    }
  `;
  const { data } = await axios.post(BASE, { query, variables: { username, limit } });
  return data.data.recentSubmissionList;
}

// Fetch contest history
export async function fetchContestHistory(username) {
  const query = `
    query userContestRanking($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount rating globalRanking
      }
    }
  `;
  const { data } = await axios.post(BASE, { query, variables: { username } });
  return data.data.userContestRanking;
}

// Fetch streak — LeetCode doesn't expose streak directly, derive from submissionCalendar
export function deriveStreakFromCalendar(submissionCalendarJson) {
  const calendar = JSON.parse(submissionCalendarJson ?? '{}');
  const today = Math.floor(Date.now() / 1000);
  const ONE_DAY = 86400;
  let current = 0;
  let longest = 0;
  let temp = 0;
  let prevDay = null;

  const days = Object.keys(calendar)
    .map(Number)
    .sort((a, b) => b - a);

  for (const ts of days) {
    const day = Math.floor(ts / ONE_DAY);
    if (prevDay === null) {
      const daysSinceToday = Math.floor(today / ONE_DAY) - day;
      if (daysSinceToday <= 1) current = 1;
      temp = 1;
    } else if (prevDay - day === 1) {
      temp++;
      if (current > 0) current++;
    } else {
      current = 0;
      temp = 1;
    }
    longest = Math.max(longest, temp);
    prevDay = day;
  }
  return { current, longest };
}
```

**What data to store from LeetCode:**

| Field | LeetCode GraphQL path |
|---|---|
| `easy.solved` | `matchedUser.submitStats.acSubmissionNum[difficulty=Easy].count` |
| `medium.solved` | `matchedUser.submitStats.acSubmissionNum[difficulty=Medium].count` |
| `hard.solved` | `matchedUser.submitStats.acSubmissionNum[difficulty=Hard].count` |
| `totalSolved` | sum of above |
| `totalSubmissions` | sum of `.submissions` for all difficulties |
| `globalRanking` | `matchedUser.profile.ranking` |
| `contestRating` | `userContestRanking.rating` |
| `contestsParticipated` | `userContestRanking.attendedContestsCount` |
| `submissionCalendar` | `matchedUser.submissionCalendar` (JSON string) |
| `recentSubmissions` | `recentSubmissionList` |

---

### 5.2 GitHub REST API

Use `@octokit/rest` or plain `axios` with a `Authorization: Bearer GITHUB_TOKEN` header.

```js
// services/github.service.js
import axios from 'axios';

const BASE = 'https://api.github.com';
const headers = () => ({
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
});

// Total public repos
export async function fetchUserInfo(username) {
  const { data } = await axios.get(`${BASE}/users/${username}`, { headers: headers() });
  return {
    publicRepos: data.public_repos,
    followers:   data.followers,
    avatarUrl:   data.avatar_url,
  };
}

// Repositories with commit count approximation
export async function fetchRepos(username) {
  const { data } = await axios.get(
    `${BASE}/users/${username}/repos?sort=pushed&per_page=30`,
    { headers: headers() }
  );
  return data.map((r) => ({
    repoId:    String(r.id),
    name:      r.name,
    language:  r.language ?? 'Unknown',
    updatedAt: r.pushed_at,
    // commit count: fetch separately per repo if needed
  }));
}

// Commit count for a single repo in the last 30 days
export async function fetchRepoCommitCount(owner, repo) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await axios.get(
    `${BASE}/repos/${owner}/${repo}/commits?since=${since}&per_page=100`,
    { headers: headers() }
  );
  return data.length;
}

// Total commit count across all repos (last 30 days via events)
export async function fetchTotalCommits(username) {
  const { data } = await axios.get(
    `${BASE}/users/${username}/events?per_page=100`,
    { headers: headers() }
  );
  const pushEvents = data.filter((e) => e.type === 'PushEvent');
  return pushEvents.reduce((acc, e) => acc + (e.payload.commits?.length ?? 0), 0);
}

// Contribution heatmap — GitHub does not expose this publicly in the REST API.
// Options:
//   a) Scrape the SVG from https://github.com/users/{username}/contributions
//   b) Use the GraphQL API: https://api.github.com/graphql (requires token)
export async function fetchContributionCalendar(username) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount weekday
              }
            }
          }
        }
      }
    }
  `;
  const { data } = await axios.post(
    'https://api.github.com/graphql',
    { query, variables: { username } },
    { headers: headers() }
  );
  return data.data.user.contributionsCollection.contributionCalendar.weeks;
}

// Pull requests opened by user
export async function fetchPullRequests(username) {
  const { data } = await axios.get(
    `${BASE}/search/issues?q=author:${username}+type:pr&per_page=100`,
    { headers: headers() }
  );
  return data.total_count;
}
```

---

### 5.3 Codeforces API

Codeforces has a free public REST API. No auth needed for read operations.

```js
// services/codeforces.service.js
import axios from 'axios';

const BASE = 'https://codeforces.com/api';

// User info (rating, rank, etc.)
export async function fetchUserInfo(handle) {
  const { data } = await axios.get(`${BASE}/user.info?handles=${handle}`);
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result[0];
}

// All submissions (can be large — paginate or limit)
export async function fetchSubmissions(handle, count = 50) {
  const { data } = await axios.get(
    `${BASE}/user.status?handle=${handle}&from=1&count=${count}`
  );
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result;
}

// Contest history
export async function fetchContestHistory(handle) {
  const { data } = await axios.get(`${BASE}/user.rating?handle=${handle}`);
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result;
}
```

**What data to store from Codeforces:**

| Field | Codeforces API path |
|---|---|
| `totalSolved` | unique accepted problems from `user.status` |
| `globalRanking` | `user.info.rank` / `maxRank` |
| `contestRating` | `user.info.rating` |
| `contestsParticipated` | count of `user.rating` entries |
| `recentSubmissions` | last N from `user.status` |

---

## 6. Score Computation Logic

Scores are computed in `services/score.service.js` after each sync.

```js
// services/score.service.js

/**
 * LeetCode Score Formula:
 *   Base points per difficulty solved:
 *     Easy   = 2 pts
 *     Medium = 5 pts
 *     Hard   = 10 pts
 *   Streak bonus: +1 per active streak day (max 50)
 *   Contest bonus: floor(contestRating / 100) pts
 *
 * Example: 150 easy + 200 medium + 50 hard + 12-day streak + rating 1842
 *   = (150×2) + (200×5) + (50×10) + 12 + 18 = 300+1000+500+12+18 = 1830
 */
export function computeLeetcodeScore(stat) {
  const { easy, medium, hard, currentStreak = 0, contestRating = 0 } = stat.leetcode;
  return (
    (easy.solved  ?? 0) * 2 +
    (medium.solved ?? 0) * 5 +
    (hard.solved   ?? 0) * 10 +
    Math.min(currentStreak, 50) +
    Math.floor((contestRating ?? 0) / 100)
  );
}

/**
 * GitHub Score Formula:
 *   Commits (last 30 days) = 3 pts each
 *   Pull Requests          = 5 pts each
 *   Active repos (commits > 0) = 10 pts each (max 5 repos)
 *
 * Example: 128 commits + 24 PRs + 4 active repos
 *   = (128×3) + (24×5) + (4×10) = 384+120+40 = 544
 */
export function computeGithubScore(stat) {
  const activeRepos = (stat.topRepositories ?? [])
    .filter((r) => r.commits > 0).length;
  return (
    (stat.totalCommits   ?? 0) * 3 +
    (stat.pullRequests   ?? 0) * 5 +
    Math.min(activeRepos, 5)   * 10
  );
}

export function computeTotalScore(lcScore, ghScore) {
  return lcScore + ghScore;
}
```

After computing, update `CodingStat.leetcodeScore` and `GithubStat.githubScore` in MongoDB.

---

## 7. Cron Jobs — Sync Strategy

### `jobs/syncCodingStats.job.js`

Runs daily at 2 AM. Fetches LeetCode + Codeforces data for every student.

```
Schedule: 0 2 * * *  (every day at 02:00)

Steps:
  1. Query all users where role='student' AND (leetcodeUsername != '' OR codeforcesUsername != '')
  2. For each user (process in batches of 10 to avoid rate limits):
     a. Call leetcode.service.fetchLeetCodeStats(user.leetcodeUsername)
     b. Call leetcode.service.fetchRecentSubmissions(user.leetcodeUsername)
     c. Call leetcode.service.fetchContestHistory(user.leetcodeUsername)
     d. Call codeforces.service.fetchSubmissions(user.codeforcesUsername)
     e. Call codeforces.service.fetchContestHistory(user.codeforcesUsername)
     f. Compute streak from calendar
     g. Map raw API data → CodingStat schema fields
     h. Compute leetcodeScore via score.service
     i. Upsert CodingStat document (findOneAndUpdate with upsert:true)
     j. Insert ActivityLog if solved count increased
  3. Log sync summary
```

**Rate limit considerations:**
- LeetCode GraphQL: No official limit, but throttle requests to ~1 req/sec
- Codeforces: 5 requests per second per IP — add a 200ms delay between calls

### `jobs/syncGithubStats.job.js`

Runs daily at 3 AM.

```
Schedule: 0 3 * * *

Steps:
  1. Query all users where role='student' AND githubUsername != ''
  2. For each user:
     a. Call github.service.fetchUserInfo(user.githubUsername)
     b. Call github.service.fetchRepos(user.githubUsername)
     c. Call github.service.fetchTotalCommits(user.githubUsername)
     d. Call github.service.fetchPullRequests(user.githubUsername)
     e. Call github.service.fetchContributionCalendar(user.githubUsername)
     f. Map raw data → GithubStat schema
     g. Compute githubScore via score.service
     h. Upsert GithubStat document
  3. Log sync summary

Rate limits: GitHub allows 5000 requests/hour with a token.
  At ~6 calls per user × 120 students = 720 calls per run — well within limit.
```

### `jobs/buildLeaderboard.job.js`

Runs daily at 4 AM (after both sync jobs complete).

```
Schedule: 0 4 * * *

Steps:
  1. For each platform in ['leetcode', 'github', 'combined']:
     For each period in ['weekly', 'monthly']:
       a. Determine periodStart and periodEnd dates
       b. Aggregate scores:
          - For 'weekly': sum of scores where lastSyncedAt >= periodStart
          - For 'monthly': use monthly cumulative totals
          (In practice for now: just use the current CodingStat/GithubStat scores)
       c. Join with User collection for name, avatarUrl, batch, branch
       d. Sort by score DESC, assign rank
       e. Upsert LeaderboardSnapshot document
```

---

## 8. Authentication & Middleware

### Auth Flow

```
POST /api/auth/login
  → validate email + password
  → sign JWT({ userId, role }, JWT_SECRET, { expiresIn: '7d' })
  → return { token, user: { _id, name, role, email, avatarUrl, batch, branch } }
```

```js
// middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.userId).select('-passwordHash');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// middleware/role.middleware.js
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};
```

**Frontend usage:** The frontend `api.js` attaches the JWT automatically:
```js
// frontend/src/services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('utpt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 9. API Endpoints — Student

All student routes are protected: `verifyToken + requireRole('student')`.  
Base path: `/api/student`

---

### `GET /api/student/profile`

Returns the logged-in student's profile.

**Controller logic:**
```
req.user is already loaded by verifyToken
Return: pick(req.user, [_id, name, email, role, batch, branch, specialization, avatarUrl, joinedAt])
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1c9e8a7b3c2d4e5f60001",
    "name": "Pawan Kumar",
    "email": "pawan.kumar@utpt.edu",
    "role": "student",
    "batch": "2026",
    "branch": "CSE",
    "specialization": "AI/ML",
    "avatarUrl": "https://...",
    "joinedAt": "2024-08-12T00:00:00.000Z"
  }
}
```

---

### `GET /api/student/coding-stats`

Returns high-level coding stats for the dashboard home page.

**Controller logic:**
```
1. Find CodingStat where userId = req.user._id
2. Compute rank: count CodingStats where leetcodeScore > this student's leetcodeScore, +1
3. Find LeaderboardSnapshot(platform='leetcode', period='weekly') for batch ranking
4. Return combined stats + streaks + rank
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSolved": 532,
    "easy":   { "solved": 152, "total": 400, "percentage": 42 },
    "medium": { "solved": 178, "total": 450, "percentage": 49 },
    "hard":   { "solved": 35,  "total": 200, "percentage": 9  },
    "currentStreak": 14,
    "longestStreak": 28,
    "totalCommits": 128,
    "rank": 23,
    "ranking": { "batch": 4, "branch": 7, "specialization": 2 }
  }
}
```

---

### `GET /api/student/coding-progress?platform=all`

Full coding progress page data.

**Query params:** `platform` = `all` | `leetcode` | `codeforces`

**Controller logic:**
```
1. Find CodingStat where userId = req.user._id
2. If platform='all': return combined stats
   If platform='leetcode': return leetcode stats
   If platform='codeforces': return codeforces stats
3. Include recentSubmissions (last 5), problemsOverTime, submissionCalendar
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalSolved": 365,
      "easy":   { "solved": 152, "total": 400, "percentage": 42 },
      "medium": { "solved": 178, "total": 450, "percentage": 49 },
      "hard":   { "solved": 35,  "total": 200, "percentage": 9  },
      "globalRanking": 12842,
      "globalRankingChange": 2153,
      "acceptanceRate": 81.2,
      "totalSubmissions": 890,
      "contestsParticipated": 18,
      "contestRating": 1842
    },
    "currentStreak": 14,
    "longestStreak": 28,
    "longestStreakRange": "12 Jan – 8 Feb 2024",
    "problemsOverTime": [
      { "date": "Apr 1", "easy": 42, "medium": 50, "hard": 12, "total": 104 }
    ],
    "calendarMonths": ["Jan", "Feb", "Mar", "Apr", "May"],
    "calendarDays": ["Mon", "Wed", "Fri", "Sat", "Sun"],
    "submissionCalendar": [0,2,3,1,4,...],
    "recentSubmissions": [
      { "problem": "Two Sum", "difficulty": "Easy", "status": "Accepted", "language": "Python", "submittedAt": "..." }
    ]
  }
}
```

---

### `GET /api/student/github-activity`

Full GitHub activity page data.

**Controller logic:**
```
1. Find GithubStat where userId = req.user._id
2. Return all fields
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCommits": 128,
    "totalCommitsChange": 18,
    "pullRequests": 24,
    "pullRequestsChange": 9,
    "repositories": 12,
    "contributionHeatmap": [[0,1,2,...], [3,0,1,...], [2,4,0,...]],
    "calendarDays": ["Mon", "Wed", "Fri"],
    "weekLabels": ["Apr 21", "Apr 28", "May 5", "May 12", "May 19"],
    "commitsOverTime": [
      { "date": "Apr 21", "commits": 22 }
    ],
    "topRepositories": [
      { "name": "CodeTrack", "commits": 56, "language": "TypeScript", "updatedAt": "...", "status": "Active" }
    ],
    "recentEvents": [
      { "type": "push", "repo": "CodeTrack", "message": "feat: add leaderboard filtering", "branch": "main", "ago": "2 hours ago" }
    ],
    "motivationalMsg": "Keep up the great work!..."
  }
}
```

---

### `GET /api/student/dashboard`

Single aggregated call for the student dashboard home page. Avoids multiple round trips.

**Controller logic:**
```
Run in parallel with Promise.all:
  - getProfile(userId)
  - getCodingStats(userId)
  - getRecentActivity(userId)
  - getGithubActivity(userId)       (just the summary fields, not full page data)
  - getLeaderboardSnapshot(userId)  (top 3 + your rank)
  - getNotifications(userId, unreadOnly=true)
```

**Response shape:**
```json
{
  "success": true,
  "data": {
    "profile":      { ... },
    "stats":        { ... },
    "activity":     [ ... ],
    "github":       { "totalCommits": 320, "repositories": 8, "status": "Active", ... },
    "leaderboard":  { "top": [...], "you": { "rank": 23, ... } },
    "notifications": [ ... ]
  }
}
```

---

### `GET /api/student/activity`

Returns the last 10 activity log entries.

**Controller logic:**
```
ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(10)
```

---

### `GET /api/student/notifications`

Returns all notifications for the student.

**Query params:** `unread=true` (optional)

**Controller logic:**
```
const query = { userId: req.user._id };
if (req.query.unread === 'true') query.read = false;
Notification.find(query).sort({ createdAt: -1 }).limit(50)
```

---

### `PATCH /api/student/notifications/:id/read`

Marks a notification as read.

---

### `PATCH /api/student/profile`

Updates the student's profile (name, avatarUrl, leetcodeUsername, githubUsername, codeforcesUsername).

---

## 10. API Endpoints — Trainer

All trainer routes: `verifyToken + requireRole('trainer')`.  
Base path: `/api/trainer`

---

### `GET /api/trainer/overview`

Returns trainer profile + overview stats.

**Controller logic:**
```
1. profile = req.user (trainer's own profile)
2. totalStudents = User.countDocuments({ role: 'student' })
3. activeStudents = User.countDocuments({ role: 'student', lastActive: { $gte: 2 days ago } })
4. avgProblemsSolved = aggregate CodingStat → avg of combined.totalSolved
5. avgStreak = aggregate CodingStat → avg of leetcode.currentStreak
6. Compute *Change fields by comparing with previous week's snapshot (store in a separate daily_stats collection or compute inline)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": { "_id": "...", "name": "Rahul Sharma", "role": "trainer", ... },
    "overview": {
      "totalStudents": 120,
      "totalStudentsChange": 8,
      "activeStudents": 85,
      "activeStudentsChange": 12,
      "inactiveStudents": 35,
      "inactiveStudentsChange": -5,
      "avgProblemsSolved": 36.4,
      "avgProblemsSolvedChange": 6.3,
      "avgStreak": 14.2,
      "avgStreakChange": 2.1
    }
  }
}
```

---

### `GET /api/trainer/students`

Paginated student list with search and filter.

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (name search)
- `filter` = `all` | `active` | `inactive` | `top` | `at-risk`

**Controller logic:**
```
1. Build query:
   - base: { role: 'student' }
   - if search: { name: { $regex: search, $options: 'i' } }
   - if filter='active':   { lastActive: { $gte: 2 days ago } }
   - if filter='inactive': { lastActive: { $lt: 2 days ago } }
   - if filter='at-risk':  join with CodingStat where score below threshold
   - if filter='top':      join with CodingStat where leetcodeScore >= 1500
2. User.find(query).skip(offset).limit(limit)
3. For each user, join CodingStat and GithubStat for scores & streak
4. Compute isAtRisk flag server-side
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "_id": "...",
        "name": "Aman Verma",
        "email": "...",
        "avatarUrl": "...",
        "batch": "2026",
        "branch": "CSE",
        "problemsSolved": 532,
        "streak": 14,
        "githubCommits": 128,
        "score": 2000,
        "growth": 12,
        "status": "Active",
        "lastActive": "...",
        "isAtRisk": false,
        "riskReason": null
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  }
}
```

---

### `GET /api/trainer/students/:id`

Full profile for one student. Used when trainer clicks "View Full Profile".

**Controller logic:**
```
1. User.findById(id)
2. CodingStat.findOne({ userId: id })
3. GithubStat.findOne({ userId: id })
4. ActivityLog.find({ userId: id }).sort({ createdAt: -1 }).limit(5)
5. Merge and return
```

---

### `GET /api/trainer/activity-trend`

Last 7 days activity trend for the trainer's dashboard chart.

**Controller logic:**
```
For each of the last 7 days:
  date = day label
  totalActivity = sum of (leetcode solutions + github commits) for that day across all students
  avgProblems = average problems solved that day

This requires either:
  a) Storing daily aggregates (recommended — a DailyStat collection)
  b) Computing from ActivityLog events (less precise but simpler)
```

---

### `GET /api/trainer/top-performers?limit=5`

Top N students by total score.

**Controller logic:**
```
CodingStat.aggregate([
  { $sort: { leetcodeScore: -1 } },
  { $limit: limit },
  { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
  { $unwind: '$user' }
])
```

---

### `GET /api/trainer/at-risk`

Students flagged as at-risk.

**At-risk criteria (any one):**
- `lastActive` > 5 days ago
- `leetcode.currentStreak` = 0
- `combined.totalSolved` < 30
- `leetcodeScore` < 500

**Controller logic:**
```
1. Find CodingStats matching at-risk criteria
2. Lookup users for each
3. Determine riskReason (most severe criterion)
4. Return top 10
```

---

### `GET /api/trainer/insights`

Dynamically computed insight alerts.

**Controller logic (compute inline):**
```
1. inactiveCount = User.countDocuments({ role: 'student', lastActive: { $lt: 7 days ago } })
2. avgThisWeek = aggregate CodingStat this week
3. avgLastWeek = aggregate CodingStat last week
4. topGrowth = student with highest score increase
5. noSubmitCount = users with no ActivityLog of type='solve' in 7 days
6. Build insight messages from these numbers
```

---

### `GET /api/trainer/immersion-exam/latest`

Latest immersion exam metadata (overview stats).

**Controller logic:**
```
ImmersionExam.findOne({ isPublished: true }).sort({ week: -1 })
+ Compute weeklyTrend: ImmersionExam.find({ isPublished: true }).sort({ week: 1 }).limit(6)
  → return as [{ week: 'Wk 1', avgScore, topic }]
```

---

### `GET /api/trainer/immersion-exam/:week/results`

All student results for a specific exam week.

**Controller logic:**
```
1. ImmersionResult.find({ week }).sort({ marks: -1 })
2. Populate userId → { name, avatarUrl, branch }
3. Assign rank based on sorted position
4. Return array
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Aman Verma",
      "avatarUrl": "...",
      "branch": "CSE",
      "marks": 98,
      "status": "Pass",
      "grade": "Good",
      "weakArea": null,
      "rank": 1
    }
  ]
}
```

---

### `POST /api/trainer/immersion-exam`

Create a new exam week (trainer enters metadata).

**Body:**
```json
{
  "week": 9,
  "topic": "Dynamic Programming",
  "date": "2024-04-06T09:00:00.000Z",
  "duration": 90
}
```

---

### `POST /api/trainer/immersion-exam/:week/results`

Bulk upload exam results (trainer submits results after grading).

**Body:**
```json
{
  "results": [
    { "userId": "...", "marks": 87 },
    { "userId": "...", "marks": 42 }
  ]
}
```

**Controller logic:**
```
For each result:
  status = marks >= 40 ? 'Pass' : 'Fail'
  grade  = marks >= 75 ? 'Good' : marks >= 50 ? 'Average' : 'Poor'
  weakArea = (marks < 75) ? determine from exam topic
  ImmersionResult.findOneAndUpdate(
    { userId, week },
    { $set: { marks, status, grade, weakArea } },
    { upsert: true }
  )

After all inserts:
  Recompute & update ImmersionExam:
    appeared, passed, avgScore, highestScore, lowestScore, passPercent, scoreDistribution, topScorers
  Assign ranks: sort all results for that week by marks DESC, update rank field

Return: { inserted: N, updated: M }
```

---

### `GET /api/trainer/dashboard`

Single aggregated call for the trainer dashboard. Runs all overview queries in parallel.

**Controller logic:**
```
Promise.all([
  getOverview(),
  getActivityTrend(),
  getTopPerformers(5),
  getAtRiskStudents(5),
  getInsights(),
  getLatestImmersionExam(),
  getImmersionResultsByWeek(latestWeek)
])
```

---

## 11. API Endpoints — Shared / Leaderboard

Protected: `verifyToken` (any role).  
Base path: `/api/leaderboard`

---

### `GET /api/leaderboard?platform=leetcode&time=weekly`

Returns the pre-computed leaderboard snapshot.

**Query params:**
- `platform` = `leetcode` | `github` | `combined`
- `time` = `weekly` | `monthly`

**Controller logic:**
```
1. LeaderboardSnapshot.findOne({ platform, period: time })
2. Mark the logged-in user's entry with isMe: true
3. Return { rows: snapshot.entries, you: entries.find(isMe) }
```

---

### `GET /api/leaderboard/immersion?week=8`

Immersion exam leaderboard for a specific week.

**Controller logic:**
```
1. ImmersionResult.find({ week }).sort({ marks: -1 })
   .populate('userId', 'name avatarUrl branch')
2. Assign rank
3. Find logged-in user's result
4. top3 = first 3 entries
5. myRank = logged-in user's rank
6. around = slice 5 before and 5 after myRank
7. weekMeta = ImmersionExam.findOne({ week }).select('topic date')
8. Return { top3, around, me, total, weekMeta }
```

---

## 12. Controllers Reference

| Controller | Functions |
|---|---|
| `auth.controller.js` | `register`, `login`, `getMe` |
| `student.controller.js` | `getDashboard`, `getProfile`, `updateProfile`, `getCodingStats`, `getCodingProgress`, `getGithubActivity`, `getActivity`, `getNotifications`, `markNotificationRead` |
| `trainer.controller.js` | `getDashboard`, `getOverview`, `getStudents`, `getStudentById`, `getActivityTrend`, `getTopPerformers`, `getAtRiskStudents`, `getInsights`, `getImmersionExam`, `getImmersionResults`, `createImmersionExam`, `uploadImmersionResults` |
| `leaderboard.controller.js` | `getLeaderboard`, `getImmersionLeaderboard` |

---

## 13. Utilities Reference

### `utils/asyncHandler.js`
Wraps async route handlers so unhandled promise rejections go to the error middleware instead of crashing.
```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
export default asyncHandler;
```

### `utils/ApiError.js`
```js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
export default ApiError;
```

### `utils/ApiResponse.js`
```js
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
export default ApiResponse;
```

### `utils/paginate.js`
```js
// Helper to build skip + limit from query params
export function getPagination(query, defaultLimit = 20) {
  const page  = Math.max(1, parseInt(query.page  ?? 1));
  const limit = Math.min(100, parseInt(query.limit ?? defaultLimit));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}
```

---

## 14. MongoDB Indexes

Run these once after creating the database (or define in Mongoose schema):

```js
// users
db.users.createIndex({ email: 1 },              { unique: true });
db.users.createIndex({ role: 1, lastActive: -1 });
db.users.createIndex({ batch: 1, branch: 1 });

// coding_stats
db.coding_stats.createIndex({ userId: 1 },                  { unique: true });
db.coding_stats.createIndex({ leetcodeScore: -1 });
db.coding_stats.createIndex({ 'leetcode.currentStreak': -1 });

// github_stats
db.github_stats.createIndex({ userId: 1 },     { unique: true });
db.github_stats.createIndex({ githubScore: -1 });

// leaderboard_snapshots
db.leaderboard_snapshots.createIndex({ platform: 1, period: 1 }, { unique: true });

// immersion_results
db.immersion_results.createIndex({ userId: 1, week: 1 }, { unique: true });
db.immersion_results.createIndex({ week: 1, marks: -1 });

// activity_logs
db.activity_logs.createIndex({ userId: 1, createdAt: -1 });

// notifications
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
```

---

## 15. Error Handling Convention

All controllers use `asyncHandler` + `ApiError`. The global error middleware catches everything.

```js
// middleware/error.middleware.js
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode ?? 500;
  const message    = err.isOperational ? err.message : 'Internal Server Error';

  // Log stack in development
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  res.status(statusCode).json({ success: false, message });
}
```

**Standard error responses:**

| Situation | Status | Message |
|---|---|---|
| Missing / invalid JWT | 401 | `"No token provided"` / `"Invalid or expired token"` |
| Wrong role | 403 | `"Access denied"` |
| Resource not found | 404 | `"Student not found"` etc. |
| Validation error | 400 | Descriptive field error |
| External API failure | 503 | `"LeetCode API unavailable"` |
| Anything else | 500 | `"Internal Server Error"` |

---

## Quick Reference — All Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/student/dashboard
GET    /api/student/profile
PATCH  /api/student/profile
GET    /api/student/coding-stats
GET    /api/student/coding-progress?platform=all|leetcode|codeforces
GET    /api/student/github-activity
GET    /api/student/activity
GET    /api/student/notifications
PATCH  /api/student/notifications/:id/read

GET    /api/trainer/dashboard
GET    /api/trainer/overview
GET    /api/trainer/students?page&limit&search&filter
GET    /api/trainer/students/:id
GET    /api/trainer/activity-trend
GET    /api/trainer/top-performers?limit
GET    /api/trainer/at-risk
GET    /api/trainer/insights
GET    /api/trainer/immersion-exam/latest
GET    /api/trainer/immersion-exam/:week/results
POST   /api/trainer/immersion-exam
POST   /api/trainer/immersion-exam/:week/results

GET    /api/leaderboard?platform=leetcode|github|combined&time=weekly|monthly
GET    /api/leaderboard/immersion?week=1-8
```

---

*Generated from the UTPT frontend mock data shapes. Every response shape in this document exactly matches what the React components and service files currently expect.*
