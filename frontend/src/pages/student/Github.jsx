import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  GitCommitHorizontal,
  GitPullRequest,
  Star,
  ChevronDown,
  GitBranch,
  ArrowUpRight,
  Rocket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GithubIcon from '@/components/icons/GithubIcon';
import { getGithubActivityPage } from '@/services/student.service';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────

const DATE_RANGES = ['Last 30 days', 'Last 7 days', 'Last 90 days'];

const HEAT_COLORS = ['#f0fdf4', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'];

const LANG_COLORS = {
  TypeScript: '#3b82f6',
  React:      '#06b6d4',
  'C++':      '#8b5cf6',
  Python:     '#f59e0b',
  Java:       '#ef4444',
  Go:         '#10b981',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        <span className="text-slate-600">{payload[0]?.value} commits</span>
      </div>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconBg, label, value, change, changeSuffix = 'vs last 30 days' }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
        <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
        {change != null && (
          <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
            <ArrowUpRight size={12} />
            {change}% {changeSuffix}
          </p>
        )}
      </div>
    </Card>
  );
}

// ── Contribution heatmap ──────────────────────────────────────────────────────

function ContributionHeatmap({ heatmap, days, weekLabels }) {
  if (!heatmap?.length) return null;
  const cols = heatmap[0]?.length ?? 0;
  const colsPerWeek = Math.floor(cols / (weekLabels.length));

  return (
    <div className="overflow-x-auto">
      {/* Week labels */}
      <div className="flex mb-2 pl-10">
        {weekLabels.map((label, i) => (
          <div
            key={i}
            className="text-[11px] text-slate-400 font-medium"
            style={{ width: `${colsPerWeek * (14 + 3)}px` }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 justify-around pr-2 shrink-0 w-8">
          {days.map((d) => (
            <span key={d} className="text-[11px] text-slate-400 text-right leading-[14px]">{d}</span>
          ))}
        </div>

        {/* Grid: columns = days, rows = day-of-week subset */}
        <div className="flex gap-[3px]">
          {Array.from({ length: cols }, (_, col) => (
            <div key={col} className="flex flex-col gap-[3px]">
              {heatmap.map((row, ri) => (
                <div
                  key={ri}
                  className="w-[14px] h-[14px] rounded-[3px] transition-all hover:scale-110 cursor-default"
                  style={{ background: HEAT_COLORS[row[col] ?? 0] }}
                  title={`${row[col] ?? 0} contribution${row[col] !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[11px] text-slate-400">Less</span>
        {HEAT_COLORS.map((c, i) => (
          <div key={i} className="w-[14px] h-[14px] rounded-[3px]" style={{ background: c }} />
        ))}
        <span className="text-[11px] text-slate-400">More</span>
      </div>
    </div>
  );
}

// ── Top Repos ─────────────────────────────────────────────────────────────────

function TopRepositories({ repos }) {
  const max = repos[0]?.commits ?? 1;
  return (
    <div className="space-y-3">
      {repos.map((repo) => {
        const pct = Math.round((repo.commits / max) * 100);
        const langColor = LANG_COLORS[repo.language] ?? '#6366f1';
        return (
          <div key={repo._id} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
              <GithubIcon className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-800 truncate">{repo.name}</span>
                <span className="text-xs text-slate-500 ml-2 shrink-0">{repo.commits} commits</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: langColor }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Recent Events ─────────────────────────────────────────────────────────────

const EVENT_ICONS = {
  push: { icon: GitCommitHorizontal, bg: 'bg-indigo-100', color: 'text-indigo-600' },
  pr:   { icon: GitPullRequest,      bg: 'bg-violet-100', color: 'text-violet-600' },
};

function RecentEvents({ events }) {
  return (
    <div className="space-y-3">
      {events.map((ev) => {
        const { icon: Icon, bg, color } = EVENT_ICONS[ev.type] ?? EVENT_ICONS.push;
        return (
          <div key={ev._id} className="flex items-start gap-3">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', bg)}>
              <Icon size={14} className={color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-800 truncate">{ev.message}</span>
                <Badge variant="muted" className="text-[10px] px-1.5 py-0 shrink-0">
                  <GitBranch size={9} className="mr-0.5 inline" />{ev.branch}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="font-medium text-slate-600">{ev.repo}</span> · {ev.ago}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const Github = () => {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [dateRange,  setDateRange]  = useState(DATE_RANGES[0]);
  const [showRangeDd, setShowRangeDd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await getGithubActivityPage()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading GitHub activity…</p>
        </div>
      </div>
    );
  }

  const {
    totalCommits, totalCommitsChange,
    pullRequests, pullRequestsChange,
    repositories,
    contributionHeatmap, calendarDays, weekLabels,
    commitsOverTime, topRepositories, recentEvents, motivationalMsg,
  } = data;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <GithubIcon className="w-5 h-5 text-slate-800" />
            <h1 className="text-xl font-bold text-slate-900">GitHub Activity</h1>
          </div>
          <p className="text-sm text-slate-500">Track your contributions and coding activity.</p>
        </div>
        {/* Date range picker */}
        <div className="relative">
          <button
            onClick={() => setShowRangeDd((p) => !p)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className="text-slate-400 text-base">📅</span>
            <span>Apr 21 – May 21, 2024</span>
            <ChevronDown size={14} className={cn('transition-transform', showRangeDd && 'rotate-180')} />
          </button>
          {showRangeDd && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg z-10 min-w-[160px] py-1">
              {DATE_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => { setDateRange(r); setShowRangeDd(false); }}
                  className={cn(
                    'w-full text-left text-sm px-4 py-2 hover:bg-slate-50 transition-colors',
                    dateRange === r ? 'text-indigo-600 font-medium' : 'text-slate-700',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={GitCommitHorizontal} iconBg="bg-indigo-500" label="Total Commits"  value={totalCommits} change={totalCommitsChange} />
        <StatCard icon={GitPullRequest}      iconBg="bg-violet-500" label="Pull Requests"  value={pullRequests}  change={pullRequestsChange}  />
        <StatCard icon={Star}                iconBg="bg-amber-500"  label="Repositories"   value={repositories}  />
      </div>

      {/* ── Contribution Heatmap ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Contribution Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ContributionHeatmap
            heatmap={contributionHeatmap}
            days={calendarDays}
            weekLabels={weekLabels}
          />
        </CardContent>
      </Card>

      {/* ── Chart + Top Repos row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Commits Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Commits Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commitsOverTime} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="commits"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#commitGrad)"
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#6366f1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Repositories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Top Repositories</CardTitle>
            <button className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors">
              View All
            </button>
          </CardHeader>
          <CardContent>
            <TopRepositories repos={topRepositories} />
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal size={16} className="text-indigo-400" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <button className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors">
            View All
          </button>
        </CardHeader>
        <CardContent>
          <RecentEvents events={recentEvents} />
        </CardContent>
      </Card>

      {/* ── Motivational Banner ── */}
      <Card className="bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Rocket size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900">Keep up the great work!</p>
            <p className="text-xs text-indigo-600 mt-0.5">{motivationalMsg}</p>
          </div>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-700">{totalCommits}</p>
              <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wide">Commits</p>
            </div>
            <div className="w-px h-10 bg-indigo-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-700">{pullRequests}</p>
              <p className="text-[10px] text-violet-400 font-medium uppercase tracking-wide">Pull Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Github;
