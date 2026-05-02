import React, { useState } from 'react';
import { useTrainerLayoutData } from '@/components/layout/TrainerLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Flame, Code2, GitBranch } from 'lucide-react';
import StudentDetailModal from '@/components/trainer/StudentDetailModal';
import { cn } from '@/lib/utils';

const medals = ['🥇', '🥈', '🥉'];

const TrainerTopPerformers = () => {
  const { data, loading } = useTrainerLayoutData();
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/60 border border-white/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const performers = data?.topPerformers ?? [];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Top Performers</h2>
          <p className="text-sm text-slate-500 mt-0.5">Your highest-scoring students this period.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performers.slice(0, 3).map((s, i) => (
            <button
              key={s._id}
              onClick={() => setSelectedStudent(s)}
              className="text-left"
            >
              <Card className="p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                <div className="flex flex-col items-center text-center gap-3">
                  <span className="text-3xl">{medals[i]}</span>
                  <Avatar className="h-16 w-16 ring-2 ring-white shadow-md">
                    <AvatarImage src={s.avatarUrl} alt={s.name} />
                    <AvatarFallback className="text-lg">{s.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.branch} · Batch {s.batch}</p>
                  </div>
                  <div className="text-2xl font-black text-indigo-600">{s.score.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    +{s.growth}% growth
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-100">
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-800">{s.problemsSolved}</p>
                      <p className="text-[10px] text-slate-400">Problems</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-0.5">
                        <Flame className="h-3 w-3 text-orange-400 fill-orange-400/20" />{s.streak}
                      </p>
                      <p className="text-[10px] text-slate-400">Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-800">{s.githubCommits}</p>
                      <p className="text-[10px] text-slate-400">Commits</p>
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {performers.map((s, i) => (
                <button
                  key={s._id}
                  onClick={() => setSelectedStudent(s)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left group"
                >
                  <span className="text-lg w-8 text-center shrink-0 leading-none">
                    {i < 3 ? medals[i] : <span className="text-sm font-bold text-slate-400">{i + 1}</span>}
                  </span>
                  <Avatar className="h-9 w-9 shrink-0 ring-1 ring-slate-100">
                    <AvatarImage src={s.avatarUrl} alt={s.name} />
                    <AvatarFallback>{s.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.branch} · Batch {s.batch}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm text-right shrink-0">
                    <div>
                      <p className="font-bold text-slate-800">{s.problemsSolved}</p>
                      <p className="text-[10px] text-slate-400">Problems</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-0.5 justify-end">
                        <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400/20" />{s.streak}
                      </p>
                      <p className="text-[10px] text-slate-400">Streak</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{s.githubCommits}</p>
                      <p className="text-[10px] text-slate-400">Commits</p>
                    </div>
                    <div>
                      <p className="font-black text-indigo-600">{s.score.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Score</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs w-16 justify-end">
                      <TrendingUp className="h-3.5 w-3.5" />+{s.growth}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
};

export default TrainerTopPerformers;
