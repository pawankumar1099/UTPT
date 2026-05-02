import React, { useState } from 'react';
import { useTrainerLayoutData } from '@/components/layout/TrainerLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, Clock, TrendingDown, Flame } from 'lucide-react';
import StudentDetailModal from '@/components/trainer/StudentDetailModal';
import { cn } from '@/lib/utils';
import { allStudents } from '@/data/trainer.mock';

const riskColors = {
  'Low activity':              { bg: 'bg-rose-50',   text: 'text-rose-600',   icon: AlertTriangle },
  'No submissions recently':   { bg: 'bg-orange-50', text: 'text-orange-600', icon: Clock },
  'Low streak':                { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: Flame },
  'Low problems solved':       { bg: 'bg-rose-50',   text: 'text-rose-600',   icon: TrendingDown },
  'Low score':                 { bg: 'bg-purple-50', text: 'text-purple-600', icon: TrendingDown },
};

const RiskBadge = ({ reason }) => {
  const cfg = riskColors[reason] ?? { bg: 'bg-slate-50', text: 'text-slate-500', icon: AlertTriangle };
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.bg, cfg.text, 'border-current/20')}>
      <Icon className="h-3 w-3" />
      {reason}
    </span>
  );
};

const TrainerAtRisk = () => {
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

  const atRiskStudents = allStudents.filter((s) => s.isAtRisk);

  const grouped = {
    critical: atRiskStudents.filter((s) => s.inactiveDays >= 7),
    warning:  atRiskStudents.filter((s) => s.inactiveDays >= 4 && s.inactiveDays < 7),
    watch:    atRiskStudents.filter((s) => s.inactiveDays < 4),
  };

  const Section = ({ title, students, accent }) => {
    if (!students.length) return null;
    const styles = {
      critical: { dot: 'bg-rose-500',   heading: 'text-rose-700',   card: 'border-rose-100' },
      warning:  { dot: 'bg-amber-500',  heading: 'text-amber-700',  card: 'border-amber-100' },
      watch:    { dot: 'bg-blue-400',   heading: 'text-blue-700',   card: 'border-blue-100'  },
    }[accent];

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', styles.dot)} />
          <h3 className={cn('text-sm font-bold uppercase tracking-wide', styles.heading)}>{title}</h3>
          <span className="text-xs text-slate-400">({students.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {students.map((s) => (
            <button
              key={s._id}
              onClick={() => setSelectedStudent(s)}
              className={cn('text-left w-full rounded-2xl border bg-white/70 p-4 hover:shadow-md hover:scale-[1.01] transition-all duration-200 group', styles.card)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 ring-1 ring-white/60 shrink-0">
                  <AvatarImage src={s.avatarUrl} alt={s.name} />
                  <AvatarFallback>{s.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {s.name}
                    </p>
                    <span className="text-xs font-bold text-rose-500 shrink-0 whitespace-nowrap">
                      {s.inactiveDays}d inactive
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{s.branch} · Batch {s.batch}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <RiskBadge reason={s.riskReason} />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>{s.problemsSolved} problems</span>
                    <span className="flex items-center gap-0.5">
                      <Flame className="h-3 w-3 text-orange-400" />{s.streak} streak
                    </span>
                    <span>{s.score.toLocaleString()} score</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">At-Risk Students</h2>
            <p className="text-sm text-slate-500 mt-0.5">Students who need your attention right now.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-xl px-3 py-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-bold text-rose-700">{atRiskStudents.length} at risk</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Section title="Critical (7+ days inactive)" students={grouped.critical} accent="critical" />
          <Section title="Warning (4–6 days inactive)" students={grouped.warning} accent="warning" />
          <Section title="Watch (1–3 days inactive)"  students={grouped.watch}    accent="watch" />
        </div>
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

export default TrainerAtRisk;
