export function computeLeetcodeScore(stat) {
  if (!stat?.leetcode) return 0;
  const { easy, medium, hard, currentStreak = 0, contestRating = 0 } = stat.leetcode;
  return (
    (easy?.solved   ?? 0) * 2  +
    (medium?.solved ?? 0) * 5  +
    (hard?.solved   ?? 0) * 10 +
    Math.min(currentStreak, 50) +
    Math.floor((contestRating ?? 0) / 100)
  );
}

export function computeGithubScore(stat) {
  if (!stat) return 0;
  const activeRepos = (stat.topRepositories ?? [])
    .filter((r) => r.commits > 0).length;
  return (
    (stat.totalCommits  ?? 0) * 3 +
    (stat.pullRequests  ?? 0) * 5 +
    Math.min(activeRepos, 5)  * 10
  );
}

export function computeTotalScore(lcScore, ghScore) {
  return lcScore + ghScore;
}
