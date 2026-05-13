import axios from 'axios';

const BASE = 'https://leetcode.com/graphql';

export async function fetchLeetCodeStats(username) {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum { difficulty count submissions }
        }
        profile { ranking }
        submissionCalendar
      }
      allQuestionsCount { difficulty count }
    }
  `;
  const { data } = await axios.post(BASE, { query, variables: { username } }, {
    headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
    timeout: 15000,
  });
  return data.data;
}

export async function fetchRecentSubmissions(username, limit = 15) {
  const query = `
    query recentSubmissions($username: String!, $limit: Int) {
      recentSubmissionList(username: $username, limit: $limit) {
        title titleSlug statusDisplay lang timestamp
      }
    }
  `;
  const { data } = await axios.post(BASE, { query, variables: { username, limit } }, {
    headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
    timeout: 15000,
  });
  return data.data?.recentSubmissionList ?? [];
}

export async function fetchContestHistory(username) {
  const query = `
    query userContestRanking($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount rating globalRanking
      }
    }
  `;
  const { data } = await axios.post(BASE, { query, variables: { username } }, {
    headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
    timeout: 15000,
  });
  return data.data?.userContestRanking ?? null;
}

export function deriveStreakFromCalendar(submissionCalendarJson) {
  let calendar = {};
  try { calendar = JSON.parse(submissionCalendarJson ?? '{}'); } catch { calendar = {}; }

  const today = Math.floor(Date.now() / 1000);
  const ONE_DAY = 86400;
  let current = 0;
  let longest = 0;
  let temp = 0;
  let prevDay = null;
  let longestStart = null;
  let longestEnd = null;

  const days = Object.keys(calendar)
    .map(Number)
    .sort((a, b) => b - a);

  for (const ts of days) {
    const day = Math.floor(ts / ONE_DAY);
    if (prevDay === null) {
      const daysSinceToday = Math.floor(today / ONE_DAY) - day;
      if (daysSinceToday <= 1) current = 1;
      temp = 1;
      longestStart = ts;
      longestEnd = ts;
    } else if (prevDay - day === 1) {
      temp++;
      longestStart = ts;
      if (current > 0) current++;
    } else {
      current = 0;
      temp = 1;
      longestStart = ts;
      longestEnd = ts;
    }
    if (temp > longest) {
      longest = temp;
    }
    prevDay = day;
  }

  const fmt = (ts) => new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const rangeStr = longestStart && longestEnd
    ? `${fmt(longestStart)} – ${fmt(longestEnd)}`
    : '';

  return { current, longest, longestStreakRange: rangeStr };
}

export function buildSubmissionCalendar(submissionCalendarJson) {
  let calendar = {};
  try { calendar = JSON.parse(submissionCalendarJson ?? '{}'); } catch { calendar = {}; }

  const ROWS = 5;
  const COLS = 20;
  const now = Date.now();
  const ONE_DAY_MS = 86400000;
  const flat = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const dayOffset = (ROWS * COLS - 1 - idx);
      const ts = Math.floor((now - dayOffset * ONE_DAY_MS) / 1000);
      const dayTs = Math.floor(ts / 86400) * 86400;
      const count = calendar[String(dayTs)] ?? 0;
      flat.push(Math.min(4, count > 0 ? (count >= 5 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : 1) : 0));
    }
  }
  return flat;
}

export function buildProblemsOverTime(submissionCalendarJson) {
  let calendar = {};
  try { calendar = JSON.parse(submissionCalendarJson ?? '{}'); } catch { calendar = {}; }

  const now = Date.now();
  const ONE_DAY_MS = 86400000;
  const points = [];
  const weeks = 5;

  for (let w = weeks - 1; w >= 0; w--) {
    const cutoffMs = now - w * 7 * ONE_DAY_MS;
    const count = Object.keys(calendar)
      .map(Number)
      .filter(ts => ts * 1000 <= cutoffMs)
      .length;

    const date = new Date(cutoffMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    points.push({ date, total: count });
  }
  return points;
}

export async function fetchFullLeetCodeData(username) {
  const [profileData, contestData, recentSubs] = await Promise.allSettled([
    fetchLeetCodeStats(username),
    fetchContestHistory(username),
    fetchRecentSubmissions(username, 15),
  ]);

  const profile = profileData.status === 'fulfilled' ? profileData.value : null;
  const contest = contestData.status === 'fulfilled' ? contestData.value : null;
  const subs    = recentSubs.status === 'fulfilled'  ? recentSubs.value  : [];

  if (!profile?.matchedUser) return null;

  const acNums = profile.matchedUser.submitStats.acSubmissionNum;
  const allQ   = profile.allQuestionsCount ?? [];

  const getCount = (diff) => acNums.find(x => x.difficulty === diff)?.count ?? 0;
  const getTotal = (diff) => allQ.find(x => x.difficulty === diff)?.count ?? 0;
  const getSubs  = (diff) => acNums.find(x => x.difficulty === diff)?.submissions ?? 0;

  const easySolved   = getCount('Easy');
  const medSolved    = getCount('Medium');
  const hardSolved   = getCount('Hard');
  const totalSolved  = easySolved + medSolved + hardSolved;

  const easyTotal    = getTotal('Easy');
  const medTotal     = getTotal('Medium');
  const hardTotal    = getTotal('Hard');

  const totalSubs    = getSubs('Easy') + getSubs('Medium') + getSubs('Hard');
  const calendarJson = profile.matchedUser.submissionCalendar;

  const { current, longest, longestStreakRange } = deriveStreakFromCalendar(calendarJson);
  const calendar = buildSubmissionCalendar(calendarJson);
  const overTime = buildProblemsOverTime(calendarJson);

  const recentSubmissions = subs.map(s => ({
    problem:     s.title,
    difficulty:  guessDifficulty(s.title),
    status:      s.statusDisplay === 'Accepted' ? 'Accepted' : s.statusDisplay,
    language:    s.lang,
    submittedAt: new Date(Number(s.timestamp) * 1000),
    platform:    'leetcode',
  }));

  const acceptedSubs = subs.filter(s => s.statusDisplay === 'Accepted').length;
  const acceptanceRate = subs.length > 0 ? Math.round((acceptedSubs / subs.length) * 1000) / 10 : 0;

  return {
    totalSolved,
    easy:   { solved: easySolved, total: easyTotal, percentage: easyTotal  ? Math.round(easySolved / easyTotal * 100) : 0 },
    medium: { solved: medSolved,  total: medTotal,  percentage: medTotal   ? Math.round(medSolved  / medTotal  * 100) : 0 },
    hard:   { solved: hardSolved, total: hardTotal, percentage: hardTotal  ? Math.round(hardSolved / hardTotal * 100) : 0 },
    globalRanking:        profile.matchedUser.profile?.ranking ?? 0,
    acceptanceRate,
    totalSubmissions:     totalSubs,
    contestsParticipated: contest?.attendedContestsCount ?? 0,
    contestRating:        contest?.rating ?? 0,
    currentStreak:        current,
    longestStreak:        longest,
    longestStreakRange,
    recentSubmissions,
    submissionCalendar:   calendar,
    problemsOverTime:     overTime,
  };
}

function guessDifficulty(title) {
  const t = title.toLowerCase();
  if (t.includes('hard') || t.includes('difficult')) return 'Hard';
  if (t.includes('medium')) return 'Medium';
  return 'Easy';
}
