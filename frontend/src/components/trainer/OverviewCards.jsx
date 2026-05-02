import React from 'react';
import { Users, UserCheck, UserX, BarChart2, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const cards = [
  {
    key: 'totalStudents',
    label: 'Total Students',
    changeKey: 'totalStudentsChange',
    icon: Users,
    iconBg: 'bg-blue-50 text-blue-500',
  },
  {
    key: 'activeStudents',
    label: 'Active Students',
    changeKey: 'activeStudentsChange',
    icon: UserCheck,
    iconBg: 'bg-emerald-50 text-emerald-500',
  },
  {
    key: 'inactiveStudents',
    label: 'Inactive Students',
    changeKey: 'inactiveStudentsChange',
    icon: UserX,
    iconBg: 'bg-rose-50 text-rose-500',
  },
  {
    key: 'avgProblemsSolved',
    label: 'Avg Problems Solved',
    changeKey: 'avgProblemsSolvedChange',
    icon: BarChart2,
    iconBg: 'bg-indigo-50 text-indigo-500',
    decimal: true,
  },
  {
    key: 'avgStreak',
    label: 'Avg Streak',
    changeKey: 'avgStreakChange',
    icon: Flame,
    iconBg: 'bg-orange-50 text-orange-500',
    decimal: true,
  },
];

const OverviewCards = ({ overview }) => {
  if (!overview) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ key, label, changeKey, icon: Icon, iconBg, decimal }) => {
        const value = overview[key];
        const change = overview[changeKey];
        const positive = change >= 0;

        return (
          <Card
            key={key}
            className="p-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                  iconBg,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                  {label}
                </p>
                <p className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                  {decimal ? value.toFixed(1) : value}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={cn(
                      'text-[11px] font-semibold',
                      positive ? 'text-emerald-600' : 'text-rose-500',
                    )}
                  >
                    {positive ? '↑' : '↓'} {Math.abs(change)}{decimal ? '' : ''} vs last week
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewCards;
