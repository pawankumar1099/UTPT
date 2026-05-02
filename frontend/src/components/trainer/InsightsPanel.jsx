import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const iconMap = {
  warning: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
  positive: { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  info: { icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

const InsightsPanel = ({ insights }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <CardTitle>Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights?.map((item, i) => {
          const { icon: Icon, color, bg } = iconMap[item.type] ?? iconMap.info;
          return (
            <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={cn('h-6 w-6 rounded-md flex items-center justify-center shrink-0 mt-0.5', bg)}>
                <Icon className={cn('h-3.5 w-3.5', color)} />
              </div>
              <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
