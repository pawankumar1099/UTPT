import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Flame, GitBranch, Code2, Trophy, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, MinusCircle, XCircle, User, Mail, BookOpen,
  Calendar, Activity,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn, timeAgo } from '@/lib/utils';
import { allStudents } from '@/data/trainer.mock';

const StatCard = ({ icon: Icon, label, value, sublabel, accent = 'indigo' }) => {
  const palette = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'bg-indigo-100 text-indigo-600',  text: 'text-indigo-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700' },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',   text: 'text-amber-700' },
    rose:    { bg: 'bg-rose-50',    icon: 'bg-rose-100 text-rose-600',    text: 'text-rose-700' },
    orange:  { bg: 'bg-orange-50',  icon: 'bg-orange-100 text-orange-600',  text: 'text-orange-700' },
    slate:   { bg: 'bg-slate-50',   icon: 'bg-slate-100 text-slate-600',   text: 'text-slate-700' },
  };
  const p = palette[accent] ?? palette.indigo;
  return (
    <div className={cn('rounded-2xl p-4 flex items-center gap-4', p.bg)}>
      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0', p.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className={cn('text-2xl font-bold leading-none', p.text)}>{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};

const DiffBar = ({ label, solved, total, colorClass }) => {
  const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="text-slate-400">
          {solved} / {total} <span className="font-bold">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', colorClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const activityIcon = (type) => {
  if (type === 'solve')  return { emoji: '💡', bg: 'bg-indigo-50',  text: 'text-indigo-600' };
  if (type === 'commit') return { emoji: '🔧', bg: 'bg-emerald-50', text: 'text-emerald-600' };
  return                        { emoji: '🏆', bg: 'bg-amber-50',   text: 'text-amber-600' };
};

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const student = useMemo(
    () => allStudents.find((s) => s._id === studentId),
    [studentId],
  );

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500 text-lg font-medium">Student not found.</p>
        <button
          onClick={() => navigate('/trainer/students')}
          className="flex items-center gap-2 text-indigo-600 hover:underline text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </button>
      </div>
    );
  }

  const stats = student.codingStats;
  const isActive = student.status === 'Active';
  const growthPositive = student.growth >= 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Trainer-view banner */}
      <div className="flex items-center gap-3 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-sm">
        <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <User className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-none">Trainer View</p>
          <p className="text-xs text-indigo-200 mt-0.5">
            You are viewing <span className="font-semibold text-white">{student.name}</span>'s full profile
          </p>
        </div>
        <button
          onClick={() => navigate('/trainer/students')}
          className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Students
        </button>
      </div>

      {/* Profile header card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg shrink-0">
            <AvatarImage src={student.avatarUrl} alt={student.name} />
            <AvatarFallback className="text-2xl font-bold">{student.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
              <span className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200',
              )}>
                {student.status}
              </span>
              {student.isAtRisk && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="h-3 w-3" /> At-Risk
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{student.email}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{student.branch} · Batch {student.batch}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Last active {timeAgo(student.lastActive)}</span>
            </div>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold shrink-0',
            growthPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
          )}>
            {growthPositive
              ? <TrendingUp className="h-4 w-4" />
              : <TrendingDown className="h-4 w-4" />}
            {growthPositive ? '+' : ''}{student.growth}% growth
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Code2}     label="Problems Solved" value={student.problemsSolved} accent="indigo" />
        <StatCard icon={Flame}     label="Current Streak"  value={`${student.streak}d`}   accent="orange" />
        <StatCard icon={GitBranch} label="GitHub Commits"  value={student.githubCommits}  accent="emerald" />
        <StatCard icon={Trophy}    label="Score"           value={student.score.toLocaleString()} accent="indigo" />
      </div>

      {/* Difficulty breakdown + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Difficulty breakdown */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Difficulty Breakdown</h2>
          </div>
          <div className="space-y-4">
            <DiffBar label="Easy"   solved={stats.easy.solved}   total={stats.easy.total}   colorClass="bg-emerald-400" />
            <DiffBar label="Medium" solved={stats.medium.solved} total={stats.medium.total} colorClass="bg-amber-400" />
            <DiffBar label="Hard"   solved={stats.hard.solved}   total={stats.hard.total}   colorClass="bg-rose-400" />
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-100">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-800">{stats.totalSolved}</p>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">Total Solved</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-800">
                {Math.round(((stats.easy.solved + stats.medium.solved + stats.hard.solved) /
                  (stats.easy.total + stats.medium.total + stats.hard.total)) * 100)}%
              </p>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">Completion</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-800">{student.streak}d</p>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">Streak</p>
            </div>
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Activity className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {student.recentActivity.length > 0 ? student.recentActivity.map((a, i) => {
              const ic = activityIcon(a.type);
              return (
                <div key={i} className={cn('flex items-start gap-3 p-3 rounded-xl', ic.bg)}>
                  <span className="text-lg leading-none mt-0.5">{ic.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', ic.text)}>{a.text}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(a.date)}</p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-400 text-center py-6">No recent activity recorded.</p>
            )}
          </div>

          {/* GitHub commits callout */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <GitBranch className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{student.githubCommits} Commits</p>
              <p className="text-xs text-slate-400">Total GitHub contributions</p>
            </div>
          </div>
        </Card>
      </div>

      {/* At-risk warning */}
      {student.riskReason && (
        <Card className="p-5 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">At-Risk Student</p>
              <p className="text-sm text-amber-600 mt-0.5">{student.riskReason}</p>
              <p className="text-xs text-amber-500 mt-1">
                This student has been inactive for {student.inactiveDays} day{student.inactiveDays !== 1 ? 's' : ''}. Consider sending a reminder.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentProfile;
