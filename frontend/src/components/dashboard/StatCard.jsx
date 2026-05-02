import React from 'react';
import { Card } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

const StatCard = ({ icon: Icon, label, value, sublabel, accent = 'indigo', percentage }) => {
  const accents = {
    indigo: 'bg-white dark:bg-slate-700/60 text-black dark:text-slate-200 border border-slate-200 dark:border-slate-600',
    emerald: 'bg-white dark:bg-slate-700/60 text-black dark:text-slate-200 border border-slate-200 dark:border-slate-600',
    amber: 'bg-white dark:bg-slate-700/60 text-black dark:text-slate-200 border border-slate-200 dark:border-slate-600',
    rose: 'bg-white dark:bg-slate-700/60 text-black dark:text-slate-200 border border-slate-200 dark:border-slate-600',
    orange: 'bg-white dark:bg-slate-700/60 text-black dark:text-slate-200 border border-slate-200 dark:border-slate-600',
    slate: 'bg-white dark:bg-slate-700/60 text-black dark:text-slate-200 border border-slate-200 dark:border-slate-600',
  };

  return (
    <Card className="p-5 hover:shadow-md hover:scale-105 transition-shadow rounded-sm">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'h-12 w-12 rounded-sm flex items-center justify-center shrink-0',
            accents[accent],
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight mt-1">
            {formatNumber(value)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {sublabel && <p className="text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>}
            {percentage !== undefined && (
              <span
                className={cn(
                  'text-xs font-semibold',
                  accent === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
                  accent === 'amber' && 'text-amber-600 dark:text-amber-400',
                  accent === 'rose' && 'text-rose-600 dark:text-rose-400',
                  accent === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
                )}
              >
                {percentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
