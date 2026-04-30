import React from 'react';
import { Code2, BarChart3, Search, ChevronRight } from 'lucide-react';
import GithubIcon from '@/components/icons/GithubIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const actions = [
  {
    Icon: Code2,
    title: 'Solve Problems',
    subtitle: 'Start Solving',
    bg: 'bg-indigo-100',
    color: 'text-indigo-600',
  },
  {
    Icon: GithubIcon,
    title: 'Link GitHub',
    subtitle: 'Connect Account',
    bg: 'bg-emerald-100',
    color: 'text-emerald-600',
  },
  {
    Icon: BarChart3,
    title: 'View Analytics',
    subtitle: 'Detailed Stats',
    bg: 'bg-amber-100',
    color: 'text-amber-600',
  },
  {
    Icon: Search,
    title: 'Search Students',
    subtitle: 'Find & Connect',
    bg: 'bg-rose-100',
    color: 'text-rose-600',
  },
];

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map(({ Icon, title, subtitle, bg, color }) => (
            <button
              key={title}
              className="flex items-center gap-3 rounded-lg border border-slate-200/70 p-3 text-left hover:bg-slate-50 hover:border-indigo-200 transition-colors"
            >
              <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
