import React from 'react';
import { Card } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

const StatCard = ({ icon: Icon, label, value, sublabel, accent = 'indigo', percentage }) => {
  const accents = {
    indigo: 'bg-white text-black border border-slate-500',
    emerald: 'bg-white text-black border border-slate-500',
    amber: 'bg-white text-black border border-slate-500',
    rose: 'bg-white text-black border border-slate-500',
    orange: 'bg-white text-black border border-slate-500',
    slate: 'bg-white text-black border border-slate-500',
  };

  return (
    <Card className="p-5 hover:shadow-md hover:scale-105 transition-shadow rounded-sm border border-slate-300">
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
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">
            {formatNumber(value)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
            {percentage !== undefined && (
              <span
                className={cn(
                  'text-xs font-semibold',
                  accent === 'emerald' && 'text-emerald-600',
                  accent === 'amber' && 'text-amber-600',
                  accent === 'rose' && 'text-rose-600',
                  accent === 'indigo' && 'text-indigo-600',
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
