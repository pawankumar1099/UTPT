export function computeLeetcodeScore(lc) {
  if (!lc) return 0;
  const problemScore = (lc.easy?.solved ?? 0) * 1
    + (lc.medium?.solved ?? 0) * 3
    + (lc.hard?.solved ?? 0) * 7;
  const streakBonus = (lc.currentStreak ?? 0) * 10;
  const contestBonus = Math.floor((lc.contestRating ?? 0) * 0.5);
  return Math.round(problemScore + streakBonus + contestBonus);
}

export function computeCodeforcesScore(cf) {
  if (!cf) return 0;
  const problemScore = (cf.easy?.solved ?? 0) * 1
    + (cf.medium?.solved ?? 0) * 3
    + (cf.hard?.solved ?? 0) * 7;
  const contestBonus = Math.floor((cf.contestRating ?? 0) * 0.3);
  return Math.round(problemScore + contestBonus);
}

export function computeGithubScore(gh) {
  if (!gh) return 0;
  const commitScore = (gh.totalCommits ?? 0) * 2;
  const prScore     = (gh.pullRequests ?? 0) * 15;
  const repoScore   = (gh.repositories ?? 0) * 5;
  return Math.round(commitScore + prScore + repoScore);
}

export function buildCombinedStats(lc, cf) {
  if (!lc && !cf) return null;
  const safeLC = lc ?? {};
  const safeCF = cf ?? {};

  const easySolved   = (safeLC.easy?.solved ?? 0)   + (safeCF.easy?.solved ?? 0);
  const medSolved    = (safeLC.medium?.solved ?? 0)  + (safeCF.medium?.solved ?? 0);
  const hardSolved   = (safeLC.hard?.solved ?? 0)    + (safeCF.hard?.solved ?? 0);
  const easyTotal    = (safeLC.easy?.total ?? 0)     + (safeCF.easy?.total ?? 0);
  const medTotal     = (safeLC.medium?.total ?? 0)   + (safeCF.medium?.total ?? 0);
  const hardTotal    = (safeLC.hard?.total ?? 0)     + (safeCF.hard?.total ?? 0);
  const totalSolved  = easySolved + medSolved + hardSolved;
  const totalSubs    = (safeLC.totalSubmissions ?? 0) + (safeCF.totalSubmissions ?? 0);
  const totalContests = (safeLC.contestsParticipated ?? 0) + (safeCF.contestsParticipated ?? 0);

  const allSubs = [
    ...(safeLC.recentSubmissions ?? []),
    ...(safeCF.recentSubmissions ?? []),
  ].sort((a, b) => (b.submittedAt?.getTime?.() ?? 0) - (a.submittedAt?.getTime?.() ?? 0));

  const lcAcc = safeLC.acceptanceRate ?? 0;
  const cfAcc = safeCF.acceptanceRate ?? 0;
  const acceptanceRate = lcAcc && cfAcc ? Math.round((lcAcc + cfAcc) / 2 * 10) / 10
    : lcAcc || cfAcc;

  return {
    totalSolved,
    easy:   { solved: easySolved, total: easyTotal, percentage: easyTotal ? Math.round(easySolved / easyTotal * 100) : 0 },
    medium: { solved: medSolved,  total: medTotal,  percentage: medTotal  ? Math.round(medSolved  / medTotal  * 100) : 0 },
    hard:   { solved: hardSolved, total: hardTotal, percentage: hardTotal ? Math.round(hardSolved / hardTotal * 100) : 0 },
    acceptanceRate,
    totalSubmissions:     totalSubs,
    contestsParticipated: totalContests,
    recentSubmissions:    allSubs.slice(0, 15),
  };
}

export function buildCombinedCalendar(lcCalendar, cfCalendar) {
  const len = Math.max(lcCalendar?.length ?? 0, cfCalendar?.length ?? 0);
  if (len === 0) return [];
  return Array.from({ length: len }, (_, i) => {
    const a = lcCalendar?.[i] ?? 0;
    const b = cfCalendar?.[i] ?? 0;
    return Math.min(4, a + b);
  });
}

export function buildCombinedProblemsOverTime(lcOverTime, cfOverTime) {
  const map = {};
  for (const p of (lcOverTime ?? [])) {
    map[p.date] = { date: p.date, leetcode: p.total ?? 0, codeforces: 0, total: p.total ?? 0 };
  }
  for (const p of (cfOverTime ?? [])) {
    if (map[p.date]) {
      map[p.date].codeforces = p.total ?? 0;
      map[p.date].total = (map[p.date].leetcode ?? 0) + (p.total ?? 0);
    } else {
      map[p.date] = { date: p.date, leetcode: 0, codeforces: p.total ?? 0, total: p.total ?? 0 };
    }
  }
  return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
}
