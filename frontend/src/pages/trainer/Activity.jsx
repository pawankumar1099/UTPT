import React from 'react';
import { useTrainerLayoutData } from '@/components/layout/TrainerLayout';
import ActivityTrendChart from '@/components/trainer/ActivityTrendChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatRow = ({ label, value, change, suffix = '' }) => {
  const up = change > 0;
  const neutral = change === 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-900">{value}{suffix}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : neutral ? 'text-slate-400' : 'text-rose-500'}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : neutral ? <Minus className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(change)}{suffix}
        </span>
      </div>
    </div>
  );
};

const TrainerActivity = () => {
  const { data, loading } = useTrainerLayoutData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-72 rounded-2xl bg-white/60 border border-white/40 animate-pulse" />
        <div className="h-64 rounded-2xl bg-white/60 border border-white/40 animate-pulse" />
      </div>
    );
  }

  const trend = data?.trend ?? [];
  const latest = trend[trend.length - 1];
  const first = trend[0];
  const avgChange = latest && first ? +(latest.avgProblems - first.avgProblems).toFixed(1) : 0;
  const activityChange = latest && first ? latest.totalActivity - first.totalActivity : 0;
  const peakDay = trend.reduce((best, d) => (d.avgProblems > (best?.avgProblems ?? 0) ? d : best), null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Activity</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track batch activity trends over time.</p>
      </div>

      <ActivityTrendChart trend={trend} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>This Week at a Glance</CardTitle>
          </CardHeader>
          <CardContent>
            <StatRow label="Avg Problems Solved (today)" value={latest?.avgProblems ?? '—'} change={avgChange} />
            <StatRow label="Total Activities" value={latest?.totalActivity ?? '—'} change={activityChange} />
            <StatRow label="Peak Day" value={peakDay?.date ?? '—'} change={0} />
            <StatRow label="Days Tracked" value={trend.length} change={0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trend.map((d) => {
              const pct = Math.round((d.avgProblems / 60) * 100);
              return (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-14 shrink-0">{d.date}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-6 text-right">{d.avgProblems}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerActivity;
