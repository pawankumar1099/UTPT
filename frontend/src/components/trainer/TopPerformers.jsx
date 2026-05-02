import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const medals = ['🥇', '🥈', '🥉', '4', '5'];

const TopPerformers = ({ performers, onViewStudent }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Top Performers</CardTitle>
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {performers?.map((s, i) => (
          <button
            key={s._id}
            onClick={() => onViewStudent?.(s)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
          >
            <span className="text-lg w-6 text-center leading-none shrink-0">
              {i < 3 ? medals[i] : <span className="text-sm font-bold text-slate-400">{i + 1}</span>}
            </span>
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/60">
              <AvatarImage src={s.avatarUrl} alt={s.name} />
              <AvatarFallback>{s.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                {s.name}
              </p>
              <p className="text-[11px] text-slate-400">Score: {s.score.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">+{s.growth}%</span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default TopPerformers;
