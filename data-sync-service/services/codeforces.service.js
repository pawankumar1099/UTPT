import axios from 'axios';

const BASE = 'https://codeforces.com/api';

async function cfGet(endpoint) {
  const { data } = await axios.get(`${BASE}/${endpoint}`, { timeout: 15000 });
  if (data.status !== 'OK') throw new Error(`Codeforces API error: ${data.comment ?? 'unknown'}`);
  return data.result;
}

export async function fetchUserInfo(handle) {
  const result = await cfGet(`user.info?handles=${encodeURIComponent(handle)}`);
  return result[0];
}

export async function fetchUserRating(handle) {
  try {
    const result = await cfGet(`user.rating?handle=${encodeURIComponent(handle)}`);
    return result;
  } catch {
    return [];
  }
}

export async function fetchUserSubmissions(handle, count = 50) {
  try {
    const result = await cfGet(`user.status?handle=${encodeURIComponent(handle)}&count=${count}`);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

function mapCfDifficulty(rating) {
  if (!rating) return 'Easy';
  if (rating >= 2000) return 'Hard';
  if (rating >= 1400) return 'Medium';
  return 'Easy';
}

function mapCfVerdict(verdict) {
  if (verdict === 'OK') return 'Accepted';
  if (verdict === 'WRONG_ANSWER') return 'Wrong Answer';
  if (verdict === 'TIME_LIMIT_EXCEEDED') return 'Time Limit Exceeded';
  return verdict ?? 'Unknown';
}

function deriveStreakFromSubmissions(submissions) {
  const acceptedDays = new Set();
  for (const s of submissions) {
    if (s.verdict === 'OK') {
      const day = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
      acceptedDays.add(day);
    }
  }

  const sortedDays = [...acceptedDays].sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().slice(0, 10);
  let current = 0;
  let longest = 0;
  let temp = 0;
  let prevDate = null;

  for (const day of sortedDays) {
    if (prevDate === null) {
      const diff = (new Date(today) - new Date(day)) / 86400000;
      if (diff <= 1) current = 1;
      temp = 1;
    } else {
      const diff = (new Date(prevDate) - new Date(day)) / 86400000;
      if (diff === 1) {
        temp++;
        if (current > 0) current++;
      } else {
        current = 0;
        temp = 1;
      }
    }
    longest = Math.max(longest, temp);
    prevDate = day;
  }

  return { current, longest };
}

function buildCalendarFromSubmissions(submissions) {
  const ROWS = 5;
  const COLS = 20;
  const now = Date.now();
  const ONE_DAY_MS = 86400000;

  const dayMap = {};
  for (const s of submissions) {
    if (s.verdict !== 'OK') continue;
    const key = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    dayMap[key] = (dayMap[key] ?? 0) + 1;
  }

  const flat = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const dayOffset = ROWS * COLS - 1 - idx;
      const d = new Date(now - dayOffset * ONE_DAY_MS).toISOString().slice(0, 10);
      const count = dayMap[d] ?? 0;
      flat.push(Math.min(4, count > 0 ? (count >= 5 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : 1) : 0));
    }
  }
  return flat;
}

export async function fetchFullCodeforcesData(handle) {
  const [userInfo, ratingHistory, submissions] = await Promise.allSettled([
    fetchUserInfo(handle),
    fetchUserRating(handle),
    fetchUserSubmissions(handle, 100),
  ]);

  const info    = userInfo.status    === 'fulfilled' ? userInfo.value    : null;
  const ratings = ratingHistory.status === 'fulfilled' ? ratingHistory.value : [];
  const subs    = submissions.status  === 'fulfilled' ? submissions.value  : [];

  if (!info) return null;

  const acceptedSubs = subs.filter(s => s.verdict === 'OK');
  const solvedProblems = new Set(
    acceptedSubs.map(s => `${s.problem?.contestId}-${s.problem?.index}`)
  );

  const totalSolved = solvedProblems.size;

  const easyProblems   = [...solvedProblems].filter(k => {
    const s = acceptedSubs.find(x => `${x.problem?.contestId}-${x.problem?.index}` === k);
    return (s?.problem?.rating ?? 0) < 1400;
  });
  const medProblems    = [...solvedProblems].filter(k => {
    const s = acceptedSubs.find(x => `${x.problem?.contestId}-${x.problem?.index}` === k);
    const r = s?.problem?.rating ?? 0;
    return r >= 1400 && r < 2000;
  });
  const hardProblems   = [...solvedProblems].filter(k => {
    const s = acceptedSubs.find(x => `${x.problem?.contestId}-${x.problem?.index}` === k);
    return (s?.problem?.rating ?? 0) >= 2000;
  });

  const { current, longest } = deriveStreakFromSubmissions(subs);
  const calendar = buildCalendarFromSubmissions(subs);

  const contestsParticipated = ratings.length;
  const contestRating = info.rating ?? 0;
  const globalRanking = info.rank ? 0 : 0;

  const recentSubmissions = subs.slice(0, 15).map(s => ({
    problem:     `${s.problem?.name ?? 'Unknown'} (${s.problem?.contestId ?? ''})`,
    difficulty:  mapCfDifficulty(s.problem?.rating),
    status:      mapCfVerdict(s.verdict),
    language:    s.programmingLanguage ?? 'Unknown',
    submittedAt: new Date(s.creationTimeSeconds * 1000),
    platform:    'codeforces',
  }));

  const acceptanceRate = subs.length > 0
    ? Math.round((acceptedSubs.length / subs.length) * 1000) / 10
    : 0;

  return {
    totalSolved,
    easy:   { solved: easyProblems.length, total: 800,  percentage: Math.round(easyProblems.length  / totalSolved * 100) || 0 },
    medium: { solved: medProblems.length,  total: 600,  percentage: Math.round(medProblems.length   / totalSolved * 100) || 0 },
    hard:   { solved: hardProblems.length, total: 300,  percentage: Math.round(hardProblems.length  / totalSolved * 100) || 0 },
    globalRanking,
    acceptanceRate,
    totalSubmissions:     subs.length,
    contestsParticipated,
    contestRating,
    currentStreak:   current,
    longestStreak:   longest,
    recentSubmissions,
    submissionCalendar: calendar,
  };
}
