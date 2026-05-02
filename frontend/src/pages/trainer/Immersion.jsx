import React, { useState, useMemo } from 'react';
import { useTrainerLayoutData } from '@/hooks/useTrainerLayoutData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen, Search, AlertTriangle, Calendar,
  TrendingUp, TrendingDown, CheckCircle2, Users, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const DIST_COLORS = {
  '0–20':   '#f87171',
  '21–40':  '#fb923c',
  '41–60':  '#fbbf24',
  '61–80':  '#818cf8',
  '81–100': '#34d399',
};

const TabBtn = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap',
      active
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-500 hover:text-slate-700 hover:bg-white/60',
    )}
  >
    {children}
  </button>
);

const StatCard = ({ label, value, sub, color = 'slate', icon: Icon }) => (
  <div
    className={cn(
      'rounded-2xl p-5 border flex flex-col gap-2',
      color === 'emerald' ? 'bg-emerald-50 border-emerald-100' :
      color === 'rose'    ? 'bg-rose-50 border-rose-100' :
      color === 'indigo'  ? 'bg-indigo-50 border-indigo-100' :
      color === 'amber'   ? 'bg-amber-50 border-amber-100' :
      'bg-white/60 border-white/40 backdrop-blur-md',
    )}
  >
    {Icon && (
      <div className={cn(
        'h-8 w-8 rounded-lg flex items-center justify-center',
        color === 'emerald' ? 'bg-emerald-100' :
        color === 'rose'    ? 'bg-rose-100' :
        color === 'indigo'  ? 'bg-indigo-100' :
        color === 'amber'   ? 'bg-amber-100' :
        'bg-slate-100',
      )}>
        <Icon className={cn(
          'h-4 w-4',
          color === 'emerald' ? 'text-emerald-600' :
          color === 'rose'    ? 'text-rose-600' :
          color === 'indigo'  ? 'text-indigo-600' :
          color === 'amber'   ? 'text-amber-600' :
          'text-slate-500',
        )} />
      </div>
    )}
    <p className={cn(
      'text-3xl font-black mt-1',
      color === 'emerald' ? 'text-emerald-700' :
      color === 'rose'    ? 'text-rose-700' :
      color === 'indigo'  ? 'text-indigo-700' :
      color === 'amber'   ? 'text-amber-700' :
      'text-slate-900',
    )}>
      {value}
    </p>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={cn(
    'px-2 py-0.5 rounded-full text-[11px] font-bold',
    status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
  )}>
    {status}
  </span>
);

const GradeBadge = ({ grade }) => (
  <span className={cn(
    'px-2 py-0.5 rounded-full text-[11px] font-bold',
    grade === 'Good'    ? 'bg-emerald-50 text-emerald-700' :
    grade === 'Average' ? 'bg-amber-50 text-amber-700' :
    'bg-rose-50 text-rose-700',
  )}>
    {grade}
  </span>
);

// ── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ exam }) => {
  if (!exam) return null;
  const { current, upcoming, weeklyTrend } = exam;
  const scoreUp = current.avgScoreChange >= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Appeared"
          value={current.appeared}
          sub={`of ${current.totalStudents} enrolled`}
          icon={Users}
        />
        <StatCard
          label="Passed"
          value={current.passed}
          sub={`${current.passPercent}% pass rate`}
          color="emerald"
          icon={CheckCircle2}
        />
        <StatCard
          label="Failed"
          value={current.appeared - current.passed}
          sub={`${(100 - current.passPercent).toFixed(1)}% fail rate`}
          color="rose"
          icon={XCircle}
        />
        <StatCard
          label="Avg Score"
          value={`${current.avgScore}%`}
          sub={`${scoreUp ? '▲' : '▼'} ${Math.abs(current.avgScoreChange)}% vs last week`}
          color="indigo"
          icon={scoreUp ? TrendingUp : TrendingDown}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Score Distribution</CardTitle>
            <p className="text-[11px] text-slate-400">How students scored across ranges</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {current.scoreDistribution.map((d) => {
              const pct = Math.round((d.count / current.appeared) * 100);
              return (
                <div key={d.range} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-14 shrink-0 font-medium">{d.range}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: DIST_COLORS[d.range] }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 w-8 text-right">{d.count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">6-Week Score Trend</CardTitle>
            <p className="text-[11px] text-slate-400">Class average across topics</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyTrend.map((w) => (
              <div key={w.week} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-12 shrink-0 font-medium">{w.week}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-all duration-700"
                    style={{ width: `${w.avgScore}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 w-12 text-right">{w.avgScore}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-800">
            Next up — Week {upcoming.week}: {upcoming.title}
          </p>
          <p className="text-xs text-amber-600">{formatDate(upcoming.date)} · {upcoming.duration} min</p>
        </div>
      </div>
    </div>
  );
};

// ── Graph Tab ─────────────────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-slate-700">{label}</p>
      <p className="text-slate-500 mt-0.5">{payload[0].value} students</p>
    </div>
  );
};

const CustomLineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const topic = payload[0]?.payload?.topic;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-slate-700">{label}{topic ? ` — ${topic}` : ''}</p>
      <p className="text-indigo-600 font-bold mt-0.5">{payload[0].value}%</p>
    </div>
  );
};

const GraphTab = ({ exam }) => {
  if (!exam) return null;
  const { current, weeklyTrend } = exam;
  const distData = current.scoreDistribution.map((d) => ({
    ...d,
    fill: DIST_COLORS[d.range] ?? '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Score Distribution — Week {current.week}: {current.title}</CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">Number of students in each score range</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distData} margin={{ top: 16, right: 16, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {distData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>6-Week Average Score Trend</CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">Track improvement across topics each week</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyTrend} margin={{ top: 16, right: 20, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[50, 75]} tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Students Tab ──────────────────────────────────────────────────────────────
const StudentsTab = ({ results }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const passCount = useMemo(() => (results || []).filter((s) => s.status === 'Pass').length, [results]);
  const failCount = useMemo(() => (results || []).filter((s) => s.status === 'Fail').length, [results]);

  const filtered = useMemo(() => {
    let list = results || [];
    if (filter === 'pass') list = list.filter((s) => s.status === 'Pass');
    if (filter === 'fail') list = list.filter((s) => s.status === 'Fail');
    if (search) list = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [results, filter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/60 border border-white/40 text-sm outline-none focus:ring-2 focus:ring-indigo-200 backdrop-blur-md"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {[
            { key: 'all',  label: `All (${results?.length ?? 0})` },
            { key: 'pass', label: `Pass (${passCount})` },
            { key: 'fail', label: `Fail (${failCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold transition-all',
                filter === key
                  ? key === 'fail'  ? 'bg-rose-500 text-white shadow-sm'
                  : key === 'pass'  ? 'bg-emerald-500 text-white shadow-sm'
                  :                   'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/60 border border-white/40 text-slate-500 hover:text-slate-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-16">Rank</th>
                  <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                  <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Marks</th>
                  <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Grade</th>
                  <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Weak Area</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s._id}
                    className={cn(
                      'border-b border-slate-50 transition-colors',
                      s.status === 'Fail'
                        ? 'bg-rose-50/50 hover:bg-rose-50'
                        : 'hover:bg-slate-50/60',
                    )}
                  >
                    <td className="py-3 px-4">
                      <span className={cn(
                        'text-sm font-black',
                        s.rank === 1 ? 'text-amber-500' :
                        s.rank === 2 ? 'text-slate-400' :
                        s.rank === 3 ? 'text-amber-700' : 'text-slate-400',
                      )}>
                        {s.rank <= 3 ? ['🥇', '🥈', '🥉'][s.rank - 1] : `#${s.rank}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={s.avatarUrl} />
                          <AvatarFallback className="text-[10px]">{s.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[140px]">{s.name}</p>
                          <p className="text-[11px] text-slate-400">{s.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'text-xl font-black',
                        s.marks >= 75 ? 'text-emerald-600' :
                        s.marks >= 40 ? 'text-amber-600' : 'text-rose-600',
                      )}>
                        {s.marks}
                      </span>
                      <span className="text-slate-400 text-xs ml-0.5">/100</span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                    <td className="py-3 px-4"><GradeBadge grade={s.grade} /></td>
                    <td className="py-3 px-4">
                      {s.weakArea ? (
                        <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {s.weakArea}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-14 text-center text-slate-400 text-sm">No students found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Weak Students Tab ─────────────────────────────────────────────────────────
const WeakStudentsTab = ({ results }) => {
  const weak = useMemo(
    () => (results || []).filter((s) => s.status === 'Fail' || s.grade === 'Poor'),
    [results],
  );

  if (weak.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        <p className="text-base font-semibold">All students passed!</p>
        <p className="text-sm">No students below threshold this week.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-rose-800">
            {weak.length} students need immediate attention
          </p>
          <p className="text-xs text-rose-600 mt-0.5">
            These students failed or scored poorly. Consider scheduling a review session or one-on-one follow-up.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {weak.map((s) => (
          <div
            key={s._id}
            className="bg-white/60 border-2 border-rose-200 rounded-2xl p-4 backdrop-blur-md"
            style={{ boxShadow: '0 2px 12px rgba(239,68,68,0.08)' }}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-rose-200 shrink-0">
                <AvatarImage src={s.avatarUrl} />
                <AvatarFallback className="text-sm font-bold bg-rose-50 text-rose-600">
                  {s.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{s.name}</p>
                <p className="text-[11px] text-slate-400">{s.branch}</p>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Score</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-rose-600">{s.marks}</span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>
              <GradeBadge grade={s.grade} />
            </div>

            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-400 transition-all duration-700"
                style={{ width: `${s.marks}%` }}
              />
            </div>

            {s.weakArea && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 rounded-lg px-2.5 py-1.5">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Weak area: <span className="font-bold">{s.weakArea}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-64 bg-white/60 rounded-xl" />
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 w-28 bg-white/60 rounded-lg" />)}
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-white/60 rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-64 bg-white/60 rounded-2xl" />
      <div className="h-64 bg-white/60 rounded-2xl" />
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',  label: 'Overview' },
  { key: 'graph',     label: 'Graph' },
  { key: 'students',  label: 'Students' },
  { key: 'weak',      label: 'Weak Students' },
];

const ImmersionPage = () => {
  const { data, loading } = useTrainerLayoutData();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) return <Skeleton />;

  const exam    = data?.immersionExam;
  const results = data?.immersionExamResults;
  const weakCount = (results || []).filter((s) => s.status === 'Fail' || s.grade === 'Poor').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </div>
            <h1 className="text-xl font-black text-slate-800">Immersion Exam</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 ml-10">
            Week {exam?.current?.week} · {exam?.current?.title} ·{' '}
            {exam?.current ? formatDate(exam.current.date) : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/60 border border-white/40 backdrop-blur-md rounded-xl px-3 py-2">
          <span className="text-slate-400">Duration:</span>
          <span className="font-bold text-slate-700">{exam?.current?.duration} min</span>
        </div>
      </div>

      <div className="flex gap-1 bg-white/40 border border-white/40 backdrop-blur-md rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map((t) => (
          <TabBtn key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>
            {t.label}
            {t.key === 'weak' && weakCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full h-4 px-1.5">
                {weakCount}
              </span>
            )}
          </TabBtn>
        ))}
      </div>

      {activeTab === 'overview'  && <OverviewTab  exam={exam} />}
      {activeTab === 'graph'     && <GraphTab     exam={exam} />}
      {activeTab === 'students'  && <StudentsTab  results={results} />}
      {activeTab === 'weak'      && <WeakStudentsTab results={results} />}
    </div>
  );
};

export default ImmersionPage;
