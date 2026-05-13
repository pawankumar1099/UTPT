import axios from 'axios';

const BASE = 'https://codeforces.com/api';

export async function fetchUserInfo(handle) {
  const { data } = await axios.get(`${BASE}/user.info?handles=${handle}`, { timeout: 15000 });
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result[0];
}

export async function fetchSubmissions(handle, count = 50) {
  const { data } = await axios.get(
    `${BASE}/user.status?handle=${handle}&from=1&count=${count}`,
    { timeout: 15000 }
  );
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result;
}

export async function fetchContestHistory(handle) {
  const { data } = await axios.get(`${BASE}/user.rating?handle=${handle}`, { timeout: 15000 });
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result;
}

export function computeCodeforcesStats(submissions) {
  const accepted = submissions.filter((s) => s.verdict === 'OK');
  const uniqueProblems = new Set(
    accepted.map((s) => `${s.problem.contestId}-${s.problem.index}`)
  );

  const easy   = accepted.filter((s) => (s.problem.rating ?? 0) <= 1200).length;
  const medium = accepted.filter((s) => (s.problem.rating ?? 0) > 1200 && (s.problem.rating ?? 0) <= 1800).length;
  const hard   = accepted.filter((s) => (s.problem.rating ?? 0) > 1800).length;

  return {
    totalSolved:      uniqueProblems.size,
    easy:             { solved: easy,   total: null, percentage: null },
    medium:           { solved: medium, total: null, percentage: null },
    hard:             { solved: hard,   total: null, percentage: null },
    totalSubmissions: submissions.length,
    recentSubmissions: submissions.slice(0, 10).map((s) => ({
      problem:     s.problem.name,
      difficulty:  (s.problem.rating ?? 0) <= 1200 ? 'Easy' : (s.problem.rating ?? 0) <= 1800 ? 'Medium' : 'Hard',
      status:      s.verdict === 'OK' ? 'Accepted' : s.verdict,
      language:    s.programmingLanguage,
      submittedAt: new Date(s.creationTimeSeconds * 1000),
      platform:    'codeforces',
    })),
  };
}
