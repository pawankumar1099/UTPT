import { useEffect, useState } from 'react';
import { getDashboard } from '@/services/student.service';
import { useAuthStore } from '@/store/authStore';

function buildDashboardFromStudent(student) {
  const s = student.codingStats;
  const easyPct = s.easy.total > 0 ? Math.round((s.easy.solved / s.easy.total) * 100) : 0;
  const medPct = s.medium.total > 0 ? Math.round((s.medium.solved / s.medium.total) * 100) : 0;
  const hardPct = s.hard.total > 0 ? Math.round((s.hard.solved / s.hard.total) * 100) : 0;

  return {
    profile: {
      _id: student._id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatarUrl,
      batch: student.batch,
      branch: student.branch,
      role: 'student',
    },
    stats: {
      totalSolved: s.totalSolved,
      easy: { solved: s.easy.solved, total: s.easy.total, percentage: easyPct },
      medium: { solved: s.medium.solved, total: s.medium.total, percentage: medPct },
      hard: { solved: s.hard.solved, total: s.hard.total, percentage: hardPct },
      currentStreak: student.streak,
      longestStreak: student.streak,
      totalCommits: student.githubCommits,
      rank: null,
    },
    problemsTimeline: [
      { date: 'Week 1', solved: Math.round(s.totalSolved * 0.15) },
      { date: 'Week 2', solved: Math.round(s.totalSolved * 0.32) },
      { date: 'Week 3', solved: Math.round(s.totalSolved * 0.55) },
      { date: 'Week 4', solved: Math.round(s.totalSolved * 0.75) },
      { date: 'Week 5', solved: s.totalSolved },
    ],
    github: {
      totalCommits: student.githubCommits,
      repositories: Math.max(2, Math.floor(student.githubCommits / 10)),
      status: student.status,
      username: student.name.toLowerCase().replace(' ', '-'),
      heatmap: Array.from({ length: 7 }, () =>
        Array.from({ length: 26 }, () => Math.floor(Math.random() * 5)),
      ),
      months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
      recentRepos: [
        { _id: 'r1', name: 'DSA-Solutions', status: 'Active', updatedAt: student.lastActive },
        { _id: 'r2', name: 'College-Project', status: 'Active', updatedAt: student.lastActive },
      ],
    },
    activity: student.recentActivity.map((a, i) => ({
      _id: `a${i}`,
      type: a.type,
      text: a.text,
      createdAt: a.date,
    })),
    leaderboard: {
      top: [],
      you: { _id: student._id, rank: '-', name: student.name, score: student.score },
    },
    notifications: [],
  };
}

export function useDashboard() {
  const viewingStudent = useAuthStore((s) => s.viewingStudent);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (viewingStudent) {
      setData(buildDashboardFromStudent(viewingStudent));
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    getDashboard()
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [viewingStudent]);

  return { data, loading, error };
}
