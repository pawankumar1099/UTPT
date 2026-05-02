import React from 'react';
import { BookOpen, TrendingUp, TrendingDown, Calendar, Users, Award, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LineChart, Line, Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

const medals = ['🥇', '🥈', '🥉'];

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SparkTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] shadow-md">
      <p className="font-bold text-indigo-600">{payload[0].value}%</p>
      <p className="text-slate-400">{payload[0].payload.topic}</p>
    </div>
  );
};

const ImmersionExamCard = ({ exam }) => {
  if (!exam) return null;
  const { current, upcoming, weeklyTrend } = exam;
  const scoreUp = current.avgScoreChange >= 0;

  return (
    <Card className="flex flex-col gap-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-sm">Immersion Exam</CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">Week {current.week} · {formatDate(current.date)}</p>
            </div>
          </div>
          
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-4">
        {/* Key stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 p-2.5 text-center">
            <p className="text-lg font-black text-slate-900">{current.appeared}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">Appeared</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-center">
            <p className="text-lg font-black text-emerald-700">{current.passed}</p>
            <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wide mt-0.5">Passed</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-2.5 text-center">
            <p className="text-lg font-black text-rose-700">{current.appeared - current.passed}</p>
            <p className="text-[10px] text-rose-400 font-medium uppercase tracking-wide mt-0.5">Failed</p>
          </div>
        </div>

        {/* Avg score + sparkline */}
        <div className="flex items-center gap-3 bg-indigo-50/60 rounded-xl p-3">
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Avg Score</p>
            
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
              <span>High: <b className="text-slate-600">{current.highestScore}</b></span>
              <span>·</span>
              <span>Low: <b className="text-slate-600">{current.lowestScore}</b></span>
              <span>·</span>
              <span>Pass: <b className="text-emerald-600">{current.passPercent}%</b></span>
            </div>
          </div>
          
        </div>

        {/* Score distribution mini bar */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Score Distribution</p>
          <div className="space-y-1.5">
            {current.scoreDistribution.map((d) => {
              const pct = Math.round((d.count / current.appeared) * 100);
              const isGood = d.range.startsWith('8') || d.range.startsWith('6');
              return (
                <div key={d.range} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-14 shrink-0">{d.range}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        d.range.startsWith('8') ? 'bg-emerald-400' :
                        d.range.startsWith('6') ? 'bg-indigo-400' :
                        d.range.startsWith('4') ? 'bg-amber-400' : 'bg-rose-400',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 w-6 text-right">{d.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top scorers */}
        

        {/* Upcoming exam */}
        
      </CardContent>
    </Card>
  );
};

export default ImmersionExamCard;
