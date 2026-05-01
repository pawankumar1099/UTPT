import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Code2,
  Flame,
  Trophy,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ChevronDown,
  Award,
  Target,
  Zap,
  Users,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DonutChart from '@/components/dashboard/DonutChart';
import { getCodingProgress } from '@/services/student.service';
import { cn } from '@/lib/utils';

// ── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { key: 'all', label: 'All' },
  { key: 'leetcode', label: 'LeetCode' },
  { key: 'codeforces', label: 'Codeforces' },
];

const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444', Total: '#6366f1' };
const DIFF_VARIANTS = { Easy: 'success', Medium: 'warning', Hard: 'danger' };

const LANG_COLORS = {
  Python: '#3b82f6',
  JavaScript: '#f59e0b',
  'C++': '#8b5cf6',
  Java: '#ef4444',
  Go: '#06b6d4',
};

const STATUS_MAP = {
  Accepted: { variant: 'success', icon: CheckCircle2 },
  'Wrong Answer': { variant: 'danger', icon: XCircle },
  'Time Limit Exceeded': { variant: 'warning', icon: Clock },
};

const CHART_LINES = [
  { key: 'easy', label: 'Easy', color: DIFF_COLORS.Easy },
  { key: 'medium', label: 'Medium', color: DIFF_COLORS.Medium },
  { key: 'hard', label: 'Hard', color: DIFF_COLORS.Hard },
  { key: 'total', label: 'Total', color: DIFF_COLORS.Total },
];

const HEAT_COLORS = ['#f1f5f9', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} days ago`;
}

function fmtRank(n) {
  return '#' + n.toLocaleString();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconBg, label, value, sub, subColor, badge }) {
  return (
    <Card className="flex flex-col gap-1 p-4 shadow-none">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <span className={cn('flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm')}>
          <Icon size={14} className="text-black" />
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {badge && <span className="mb-0.5">{badge}</span>}
      </div>
      {sub && <p className={cn('text-xs mt-0.5', subColor ?? 'text-slate-500')}>{sub}</p>}
    </Card>
  );
}

function PlatformFilter({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
      {PLATFORMS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            active === key
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ChartToggle({ active, options, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            'px-3 py-1 rounded-md text-xs font-medium transition-all',
            active === o ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-xs min-w-[130px]">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600 capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function SubmissionCalendar({ calendar, months, days }) {
  if (!calendar?.length) return null;
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 mb-1 pl-8 text-xs text-slate-400">
        {months.map((m, i) => (
          <span key={i} style={{ width: `${(20 / months.length) * 13}px` }} className="shrink-0">{m}</span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <div className="flex flex-col gap-1 mr-1 justify-around">
          {days.map((d) => (
            <span key={d} className="text-xs text-slate-400 w-6 text-right leading-none">{d}</span>
          ))}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: calendar[0]?.length ?? 0 }, (_, col) => (
            <div key={col} className="flex flex-col gap-1">
              {calendar.map((row, row_i) => (
                <div
                  key={row_i}
                  className="w-3.5 h-3.5 rounded-sm transition-all hover:scale-110"
                  style={{ background: HEAT_COLORS[row[col] ?? 0] }}
                  title={`${row[col] ?? 0} submissions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-xs text-slate-400">Less</span>
        {HEAT_COLORS.map((c, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-xs text-slate-400">More</span>
      </div>
    </div>
  );
}

function RecentSubmissionsTable({ submissions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-xs text-slate-500 font-medium py-2 pr-4">Problem</th>
            <th className="text-left text-xs text-slate-500 font-medium py-2 pr-4">Difficulty</th>
            <th className="text-left text-xs text-slate-500 font-medium py-2 pr-4">Status</th>
            <th className="text-left text-xs text-slate-500 font-medium py-2 pr-4">Language</th>
            <th className="text-left text-xs text-slate-500 font-medium py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            const statusInfo = STATUS_MAP[s.status] ?? { variant: 'muted', icon: Clock };
            const StatusIcon = statusInfo.icon;
            const langColor = LANG_COLORS[s.language] ?? '#94a3b8';
            return (
              <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="py-3 pr-4">
                  <span className="font-medium text-slate-800 text-xs">{s.problem}</span>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={DIFF_VARIANTS[s.difficulty]}>{s.difficulty}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon size={13} className={s.status === 'Accepted' ? 'text-emerald-500' : s.status === 'Wrong Answer' ? 'text-rose-500' : 'text-amber-500'} />
                    <span className={cn('text-xs font-medium', s.status === 'Accepted' ? 'text-emerald-600' : s.status === 'Wrong Answer' ? 'text-rose-600' : 'text-amber-600')}>
                      {s.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: langColor }} />
                    <span className="text-xs text-slate-600">{s.language}</span>
                  </div>
                </td>
                <td className="py-3 text-xs text-slate-400">{timeAgo(s.submittedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const Coding = () => {
  const [platform, setPlatform] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('Weekly');
  const [activeLines, setActiveLines] = useState({ easy: true, medium: true, hard: true, total: true });

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const result = await getCodingProgress(p);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(platform); }, [platform, load]);

  const handlePlatformChange = (p) => {
    setPlatform(p);
  };

  const toggleLine = (key) => {
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading coding progress…</p>
        </div>
      </div>
    );
  }

  const { stats, currentStreak, longestStreak, longestStreakRange, problemsOverTime, calendarMonths, calendarDays, submissionCalendar, recentSubmissions } = data;

  const donutSegments = [
    { name: 'Easy', value: stats.easy.solved, color: DIFF_COLORS.Easy },
    { name: 'Medium', value: stats.medium.solved, color: DIFF_COLORS.Medium },
    { name: 'Hard', value: stats.hard.solved, color: DIFF_COLORS.Hard },
  ];

  const platformLabel = PLATFORMS.find((p) => p.key === platform)?.label;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <TrendingUp size={20} className="text-indigo-500" />
            <h1 className="text-xl font-bold text-slate-900">Coding Progress</h1>
          </div>
          <p className="text-sm text-slate-500">Deep dive into your coding stats and track your improvement</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <PlatformFilter active={platform} onChange={handlePlatformChange} />
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors shadow-sm">
            <span>Apr 1 – Apr 30, 2024</span>
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 hover:bg-indigo-100 transition-colors">
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Code2}
          iconBg="bg-indigo-500"
          label="Total Problems Solved"
          value={stats.totalSolved.toLocaleString()}
          sub="↑ 18.6%  vs last 30 days"
          subColor="text-emerald-600"
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-emerald-500"
          label="Easy Problems"
          value={stats.easy.solved.toLocaleString()}
          badge={<Badge variant="success">Easy</Badge>}
          sub={`↑ 16.3%  ·  ${stats.easy.percentage}% of total`}
          subColor="text-emerald-600"
        />
        <StatCard
          icon={Target}
          iconBg="bg-amber-500"
          label="Medium Problems"
          value={stats.medium.solved.toLocaleString()}
          badge={<Badge variant="warning">Med</Badge>}
          sub={`↑ 20.9%  ·  ${stats.medium.percentage}% of total`}
          subColor="text-emerald-600"
        />
        <StatCard
          icon={Zap}
          iconBg="bg-rose-500"
          label="Hard Problems"
          value={stats.hard.solved.toLocaleString()}
          badge={<Badge variant="danger">Hard</Badge>}
          sub={`↑ 12.7%  ·  ${stats.hard.percentage}% of total`}
          subColor="text-emerald-600"
        />
        <StatCard
          icon={BarChart3}
          iconBg="bg-violet-500"
          label="Global Ranking"
          value={fmtRank(stats.globalRanking)}
          sub={`↑ ${stats.globalRankingChange.toLocaleString()}  vs last 30 days`}
          subColor="text-emerald-600"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Problems Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Problems Solved Over Time</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">{platformLabel} · Apr 2024</p>
            </div>
            <ChartToggle active={chartView} options={['Daily', 'Weekly', 'Monthly']} onChange={setChartView} />
          </CardHeader>
          <CardContent>
            {/* Interactive legend toggles */}
            <div className="flex flex-wrap gap-3 mb-4">
              {CHART_LINES.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => toggleLine(key)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border transition-all',
                    activeLines[key]
                      ? 'border-transparent bg-slate-100 text-slate-700'
                      : 'border-slate-200 text-slate-300',
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: activeLines[key] ? color : '#cbd5e1' }} />
                  {label}
                </button>
              ))}
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={problemsOverTime} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  {CHART_LINES.map(({ key, color }) =>
                    activeLines[key] ? (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: color, strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                        name={key.charAt(0).toUpperCase() + key.slice(1)}
                      />
                    ) : null,
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <DonutChart
                segments={donutSegments}
                size={180}
                thickness={32}
                centerLabel="Total"
                centerValue={stats.totalSolved}
              />
              <div className="w-full space-y-2">
                {donutSegments.map((seg) => {
                  const pct = Math.round((seg.value / (stats.totalSolved || 1)) * 100);
                  return (
                    <div key={seg.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                          <span className="text-slate-700 font-medium">{seg.name}</span>
                        </div>
                        <span className="text-slate-500">{seg.value} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: seg.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs font-medium text-indigo-500 text-center">Keep going! You're doing great! 🚀</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Streaks + Submission Calendar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Streak cards */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Current Streak</p>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">🔥</span>
                <div>
                  <span className="text-3xl font-bold text-slate-900">{currentStreak}</span>
                  <span className="text-base text-slate-500 ml-1">days</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">Keep it up! 🔥</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Longest Streak</p>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">🏆</span>
                <div>
                  <span className="text-3xl font-bold text-slate-900">{longestStreak}</span>
                  <span className="text-base text-slate-500 ml-1">days</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">{longestStreakRange}</p>
            </CardContent>
          </Card>
        </div>

        {/* Submission Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Submission Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionCalendar
              calendar={submissionCalendar}
              months={calendarMonths}
              days={calendarDays}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Submissions + Statistics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Submissions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-indigo-400" />
              <CardTitle>Recent Submissions</CardTitle>
            </div>
            <button className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors">
              View All
            </button>
          </CardHeader>
          <CardContent>
            <RecentSubmissionsTable submissions={recentSubmissions} />
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-400" />
              <CardTitle>Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: CheckCircle2, color: 'text-emerald-500', label: 'Acceptance Rate', value: `${stats.acceptanceRate}%` },
                { icon: Code2, color: 'text-indigo-500', label: 'Total Submissions', value: stats.totalSubmissions.toLocaleString() },
                { icon: Users, color: 'text-violet-500', label: 'Contests Participated', value: stats.contestsParticipated },
                { icon: Star, color: 'text-amber-500', label: 'Contest Rating', value: stats.contestRating.toLocaleString() },
                { icon: Trophy, color: 'text-rose-500', label: 'Global Rank', value: fmtRank(stats.globalRanking) },
              ].map(({ icon: Icon, color, label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={color} />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Coding;
