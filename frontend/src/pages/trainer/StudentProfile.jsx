import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Code2,
  CheckCircle2,
  MinusCircle,
  XCircle,
  Flame,
  GitBranch,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { allStudents } from '@/data/trainer.mock';
import { timeAgo } from '@/lib/utils';
import GithubIcon from '@/components/icons/GithubIcon';
import DonutChart from '@/components/dashboard/DonutChart';

const StatCard = ({ icon: Icon, label, value, sublabel, accent = 'indigo', percentage }) => {
  return (
    <Card className="p-5 rounded-sm">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-sm flex items-center justify-center shrink-0 bg-white text-black border border-slate-200">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">{value}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
            {percentage !== undefined && (
              <span className="text-xs font-semibold text-indigo-600">{percentage}%</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const DifficultyBar = ({ label, solved, total, color }) => {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-400">
          {solved}/{total}{' '}
          <span className="font-semibold">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const student = allStudents.find((s) => s._id === studentId);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500 text-lg">Student not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  const stats = student.codingStats;
  const isActive = student.status === 'Active';

  const easyPct = stats.easy.total > 0 ? Math.round((stats.easy.solved / stats.easy.total) * 100) : 0;
  const mediumPct = stats.medium.total > 0 ? Math.round((stats.medium.solved / stats.medium.total) * 100) : 0;
  const hardPct = stats.hard.total > 0 ? Math.round((stats.hard.solved / stats.hard.total) * 100) : 0;

  const breakdown = [
    { name: 'Easy', value: stats.easy.solved, color: '#10b981' },
    { name: 'Medium', value: stats.medium.solved, color: '#f59e0b' },
    { name: 'Hard', value: stats.hard.solved, color: '#ef4444' },
  ];
  const totalForPct = breakdown.reduce((s, b) => s + b.value, 0) || 1;

  const timeline = [
    { date: 'Week 1', solved: Math.round(stats.totalSolved * 0.15) },
    { date: 'Week 2', solved: Math.round(stats.totalSolved * 0.32) },
    { date: 'Week 3', solved: Math.round(stats.totalSolved * 0.55) },
    { date: 'Week 4', solved: Math.round(stats.totalSolved * 0.75) },
    { date: 'Week 5', solved: stats.totalSolved },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-400">Student Profile</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-white shadow-md">
            <AvatarImage src={student.avatarUrl} alt={student.name} />
            <AvatarFallback className="text-2xl">{student.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {student.status}
              </span>
              {student.isAtRisk && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="h-3 w-3" /> At-Risk
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">{student.email}</p>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400 flex-wrap">
              <span>{student.branch}</span>
              <span>·</span>
              <span>Batch {student.batch}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Last active {timeAgo(student.lastActive)}
              </span>
            </div>
            {student.riskReason && (
              <p className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5 inline-block">
                ⚠️ {student.riskReason}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`flex items-center gap-1 text-sm font-semibold ${
                student.growth >= 0 ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {student.growth >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {student.growth >= 0 ? '+' : ''}
              {student.growth}% growth
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Code2} label="Total Problems" value={stats.totalSolved} sublabel="Solved" accent="indigo" />
        <StatCard
          icon={CheckCircle2}
          label="Easy"
          value={stats.easy.solved}
          percentage={easyPct}
          accent="emerald"
        />
        <StatCard
          icon={MinusCircle}
          label="Medium"
          value={stats.medium.solved}
          percentage={mediumPct}
          accent="amber"
        />
        <StatCard
          icon={XCircle}
          label="Hard"
          value={stats.hard.solved}
          percentage={hardPct}
          accent="rose"
        />
        <StatCard icon={Flame} label="Current Streak" value={`${student.streak}d`} sublabel="Days" accent="orange" />
        <StatCard icon={GithubIcon} label="GitHub Commits" value={student.githubCommits} sublabel="Total" accent="slate" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Coding Progress</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Difficulty Breakdown</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 items-center">
              <div className="flex justify-evenly">
                <div className="flex">
                  <DonutChart
                    segments={breakdown}
                    size={220}
                    thickness={36}
                    centerLabel="Total"
                    centerValue={stats.totalSolved}
                  />
                </div>
                <div className="flex flex-col gap-4 mt-2 text-xs">
                  {breakdown.map((b) => (
                    <div key={b.name} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                      <span className="font-medium text-slate-700">{b.name}</span>
                      <span className="text-slate-500">
                        ({b.value}, {Math.round((b.value / totalForPct) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-2">Problems Solved Over Time</p>
                <div className="h-48 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline}>
                      <defs>
                        <linearGradient id="solvedGradientSP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={28} />
                      <Tooltip
                        contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="solved"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#solvedGradientSP)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Analysis</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Problem breakdown by level</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              <DifficultyBar label="Easy" solved={stats.easy.solved} total={stats.easy.total} color="bg-emerald-400" />
              <DifficultyBar label="Medium" solved={stats.medium.solved} total={stats.medium.total} color="bg-amber-400" />
              <DifficultyBar label="Hard" solved={stats.hard.solved} total={stats.hard.total} color="bg-rose-400" />
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-3">Score</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900">{student.score.toLocaleString()}</span>
                <span
                  className={`text-sm font-semibold mb-1 ${
                    student.growth >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {student.growth >= 0 ? '+' : ''}
                  {student.growth}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Overall performance score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Latest actions by this student</p>
        </CardHeader>
        <CardContent>
          {student.recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No recent activity recorded.</p>
          ) : (
            <div className="space-y-3">
              {student.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 text-sm p-3 bg-slate-50 rounded-xl">
                  <span className="text-base leading-none mt-0.5">
                    {a.type === 'solve' ? '💡' : a.type === 'commit' ? '🔧' : '🏆'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm">{a.text}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{timeAgo(a.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
