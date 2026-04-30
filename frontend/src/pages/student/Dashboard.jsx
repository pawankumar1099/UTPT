import React from 'react';
import { Code2, CheckCircle2, MinusCircle, XCircle, Flame } from 'lucide-react';
import GithubIcon from '@/components/icons/GithubIcon';
import { useLayoutData } from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import CodingProgressCard from '@/components/dashboard/CodingProgressCard';
import GithubActivityCard from '@/components/dashboard/GithubActivityCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import LeaderboardCard from '@/components/dashboard/LeaderboardCard';
import NotificationsCard from '@/components/dashboard/NotificationsCard';
import QuickActions from '@/components/dashboard/QuickActions';

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-slate-200/60" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="h-80 rounded-xl bg-slate-200/60 lg:col-span-2" />
      <div className="h-80 rounded-xl bg-slate-200/60 lg:col-span-3" />
    </div>
  </div>
);

const Dashboard = () => {
  const { data, loading, error } = useLayoutData();

  if (loading || !data) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-4">
        Failed to load dashboard.
      </div>
    );
  }

  const { stats, problemsTimeline, github, activity, leaderboard, notifications } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Code2}
          label="Total Problems"
          value={stats.totalSolved}
          sublabel="Solved"
          accent="indigo"
        />
        <StatCard
          icon={CheckCircle2}
          label="Easy"
          value={stats.easy.solved}
          percentage={stats.easy.percentage}
          accent="emerald"
        />
        <StatCard
          icon={MinusCircle}
          label="Medium"
          value={stats.medium.solved}
          percentage={stats.medium.percentage}
          accent="amber"
        />
        <StatCard
          icon={XCircle}
          label="Hard"
          value={stats.hard.solved}
          percentage={stats.hard.percentage}
          accent="rose"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={stats.currentStreak}
          sublabel="Days"
          accent="orange"
        />
        <StatCard
          icon={GithubIcon}
          label="Total Commits"
          value={stats.totalCommits}
          sublabel="This Month"
          accent="slate"
        />
      </div>

      {/* Coding progress + GitHub */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CodingProgressCard stats={stats} timeline={problemsTimeline} />
        <GithubActivityCard github={github} />
      </div>

      {/* Activity / Leaderboard / Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityCard activity={activity} />
        <LeaderboardCard leaderboard={leaderboard} />
        <NotificationsCard notifications={notifications} />
      </div>

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
