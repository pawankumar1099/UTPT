import React from 'react';
import { Folder, Activity } from 'lucide-react';
import GithubIcon from '@/components/icons/GithubIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, timeAgo } from '@/lib/utils';

const intensityClasses = [
  'bg-emerald-100',
  'bg-emerald-200',
  'bg-emerald-300',
  'bg-emerald-500',
  'bg-emerald-700',
];

const GithubActivityCard = ({ github }) => {
  if (!github) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Heatmap */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mb-1.5">
            {github.months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
            {github.heatmap.flatMap((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    'h-3 w-3 rounded-[3px]',
                    val === 0 ? 'bg-slate-100' : intensityClasses[val - 1] ?? 'bg-emerald-500',
                  )}
                  title={`${val} contributions`}
                />
              )),
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <GithubIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-none">
                {github.totalCommits}
              </p>
              <p className="text-xs text-slate-500 mt-1">Commits</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Folder className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-none">
                {github.repositories}
              </p>
              <p className="text-xs text-slate-500 mt-1">Repositories</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-none">{github.status}</p>
              <p className="text-xs text-slate-500 mt-1">Keep it up!</p>
            </div>
          </div>
        </div>

        {/* Recent repos */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Recent Repositories</p>
            <button className="text-xs text-[#0A121A] font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {github.recentRepos.map((repo) => (
              <div
                key={repo._id}
                className="flex items-center gap-3 rounded-lg border border-slate-200/70 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <GithubIcon className="h-4 w-4 text-slate-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{repo.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    Updated {timeAgo(repo.updatedAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    repo.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {repo.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GithubActivityCard;
