import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DonutChart from './DonutChart';

const COLORS = {
  Easy:   '#10b981',
  Medium: '#f59e0b',
  Hard:   '#ef4444',
};

const PERIODS = ['All Time', 'This Month', 'This Week'];

const CodingProgressCard = ({ stats, timeline = [] }) => {
  const [period, setPeriod] = useState('All Time');

  const breakdown = [
    { name: 'Easy',   value: stats?.easy?.solved   ?? 0, color: COLORS.Easy   },
    { name: 'Medium', value: stats?.medium?.solved  ?? 0, color: COLORS.Medium },
    { name: 'Hard',   value: stats?.hard?.solved    ?? 0, color: COLORS.Hard   },
  ];
  const totalForPct = breakdown.reduce((s, b) => s + b.value, 0) || 1;

  const filteredTimeline = useMemo(() => {
    if (!timeline?.length) return [];
    if (period === 'This Week')  return timeline.slice(-1);
    if (period === 'This Month') return timeline.slice(-4);
    return timeline;
  }, [timeline, period]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Coding Progress</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Difficulty Breakdown</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-600 cursor-pointer outline-none focus:border-indigo-400"
        >
          {PERIODS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 items-center">
          {/* Donut + Legend */}
          <div className="flex justify-evenly">
            <div className="flex">
              <DonutChart
                segments={breakdown}
                size={220}
                thickness={36}
                centerLabel="Total"
                centerValue={stats?.totalSolved ?? 0}
              />
            </div>
            <div className="flex flex-col gap-4 mt-2 text-xs">
              {breakdown.map((b) => (
                <div key={b.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[b.name] }} />
                  <span className="font-medium text-slate-700">{b.name}</span>
                  <span className="text-slate-500">
                    ({b.value}, {Math.round((b.value / totalForPct) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Line chart */}
          <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-2">Problems Solved Over Time</p>
            <div className="h-48 min-w-0">
              {filteredTimeline.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredTimeline}>
                    <defs>
                      <linearGradient id="solvedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={28} />
                    <Tooltip
                      contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="solved"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#solvedGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodingProgressCard;
