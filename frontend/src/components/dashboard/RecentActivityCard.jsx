import React from 'react';
import { CheckCircle2, GitCommit, TrendingUp, Star, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeAgo } from '@/lib/utils';

const ICONS = {
  solve: { Icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  commit: { Icon: GitCommit, bg: 'bg-slate-100', color: 'text-slate-700' },
  rank: { Icon: TrendingUp, bg: 'bg-indigo-100', color: 'text-indigo-600' },
  streak: { Icon: Flame, bg: 'bg-orange-100', color: 'text-orange-600' },
  default: { Icon: Star, bg: 'bg-amber-100', color: 'text-amber-600' },
};

const RecentActivityCard = ({ activity = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activity.map((item) => {
          const conf = ICONS[item.type] ?? ICONS.default;
          const Icon = conf.Icon;
          return (
            <div key={item._id} className="flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-full ${conf.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`h-4 w-4 ${conf.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{timeAgo(item.createdAt)}</span>
            </div>
          );
        })}
        <button className="w-full text-center text-sm text-indigo-600 font-medium pt-3 border-t border-slate-100 hover:underline">
          View All Activity
        </button>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
