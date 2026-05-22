import React from 'react';
import { CheckCircle2, GitCommit, TrendingUp, Star, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeAgo } from '@/lib/utils';

const ICONS = {
  solve:   { Icon: CheckCircle2, bg: 'bg-white border border-slate-200', color: 'text-black' },
  commit:  { Icon: GitCommit,    bg: 'bg-white border border-slate-200', color: 'text-black' },
  rank:    { Icon: TrendingUp,   bg: 'bg-white border border-slate-200', color: 'text-black' },
  streak:  { Icon: Flame,        bg: 'bg-white border border-slate-200', color: 'text-black' },
  default: { Icon: Star,         bg: 'bg-white border border-slate-200', color: 'text-black' },
};

const RecentActivityCard = ({ activity = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activity.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
        )}
        {activity.map((item) => {
          const conf = ICONS[item.type] ?? ICONS.default;
          const Icon = conf.Icon;
          return (
            <div key={item._id} className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-full ${conf.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${conf.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{timeAgo(item.createdAt)}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
