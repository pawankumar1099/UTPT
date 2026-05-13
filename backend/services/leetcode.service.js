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

export async function fetchRecentSubmissions(username, limit = 10) {
  const query = `
    query recentSubmissions($username: String!, $limit: Int) {
      recentSubmissionList(username: $username, limit: $limit) {
        title titleSlug status statusDisplay lang timestamp
      }
    }
  `;
  const { data } = await axios.post(BASE, { query, variables: { username, limit } }, {
    headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
    timeout: 15000,
  });
  return data.data.recentSubmissionList ?? [];
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
  return data.data.userContestRanking;
}

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

export function buildSubmissionCalendar(submissionCalendarJson, cols = 20, rows = 5) {
  const calendar = JSON.parse(submissionCalendarJson ?? '{}');
  const ONE_DAY = 86400;
  const today = Math.floor(Date.now() / 1000);
  const total = cols * rows;
  const result = new Array(total).fill(0);

  for (let i = 0; i < total; i++) {
    const dayOffset = total - 1 - i;
    const ts = (Math.floor(today / ONE_DAY) - dayOffset) * ONE_DAY;
    const count = calendar[String(ts)] ?? 0;
    result[i] = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
  }
  return result;
}
