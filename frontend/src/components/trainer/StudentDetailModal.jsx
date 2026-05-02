import React from 'react';
import { X, Flame, GitBranch, Code2, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';

const StatBox = ({ label, value, sub, accent = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className={cn('rounded-xl p-3 text-center', colors[accent])}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5 opacity-80">{label}</p>
      {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
};

const DifficultyBar = ({ label, solved, total, color }) => {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-400">
          {solved}/{total} <span className="font-semibold">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StudentDetailModal = ({ student, onClose }) => {
  const navigate = useNavigate();
  if (!student) return null;

  const isActive = student.status === 'Active';
  const stats = student.codingStats;

  const handleViewFullProfile = () => {
    onClose();
    navigate(`/trainer/students/${student._id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4 text-slate-600" />
        </button>

        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-white shadow-md">
              <AvatarImage src={student.avatarUrl} alt={student.name} />
              <AvatarFallback className="text-xl">{student.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-bold border',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200',
                  )}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{student.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                {student.branch} · Batch {student.batch} · Last active{' '}
                {timeAgo(student.lastActive)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Problems" value={student.problemsSolved} accent="indigo" />
            <StatBox
              label="Streak"
              value={`${student.streak}d`}
              accent="orange"
            />
            <StatBox label="Commits" value={student.githubCommits} accent="emerald" />
            <StatBox label="Score" value={student.score.toLocaleString()} accent={student.growth >= 0 ? 'emerald' : 'rose'} sub={`${student.growth >= 0 ? '+' : ''}${student.growth}% growth`} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Difficulty Breakdown</h3>
            <div className="space-y-2.5 bg-slate-50 rounded-xl p-4">
              <DifficultyBar
                label="Easy"
                solved={stats.easy.solved}
                total={stats.easy.total}
                color="bg-emerald-400"
              />
              <DifficultyBar
                label="Medium"
                solved={stats.medium.solved}
                total={stats.medium.total}
                color="bg-amber-400"
              />
              <DifficultyBar
                label="Hard"
                solved={stats.hard.solved}
                total={stats.hard.total}
                color="bg-rose-400"
              />
            </div>
          </div>

          {student.riskReason && (
            <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 rounded-xl p-3">
              <span className="text-rose-500 text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-rose-700">At-Risk</p>
                <p className="text-xs text-rose-500">{student.riskReason}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {student.recentActivity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm p-2.5 bg-slate-50 rounded-xl"
                >
                  <span className="text-base leading-none mt-0.5">
                    {a.type === 'solve' ? '💡' : a.type === 'commit' ? '🔧' : '🏆'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-xs">{a.text}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{timeAgo(a.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button className="flex-1 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              Send Reminder
            </button>
            <button
              onClick={handleViewFullProfile}
              className="flex-1 py-2 text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
