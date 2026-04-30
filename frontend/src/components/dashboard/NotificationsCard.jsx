import React from 'react';
import { TrendingDown, Info, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeAgo } from '@/lib/utils';

const ICONS = {
  warning: { Icon: TrendingDown, bg: 'bg-rose-100', color: 'text-rose-600' },
  info: { Icon: Info, bg: 'bg-blue-100', color: 'text-blue-600' },
  success: { Icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600' },
};

const NotificationsCard = ({ notifications = [] }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        <button className="text-xs text-indigo-600 font-medium hover:underline">View All</button>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((n) => {
          const conf = ICONS[n.type] ?? ICONS.info;
          const Icon = conf.Icon;
          return (
            <div key={n._id} className="flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-full ${conf.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`h-4 w-4 ${conf.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 leading-snug font-medium">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{timeAgo(n.createdAt)}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
