import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy, Search, Medal, TrendingUp, Users, Star, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getLeaderboard, getImmersionLeaderboard } from '@/services/student.service';
import { IMMERSION_WEEKS } from '@/data/trainer.mock';
import { cn, formatNumber } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { key: 'leetcode',  label: 'LeetCode'  },
  { key: 'github',    label: 'GitHub'    },
  { key: 'combined',  label: 'Combined'  },
  { key: 'immersion', label: 'Immersion' },
];

const TIMES = [
  { key: 'weekly',  label: 'Weekly'  },
  { key: 'monthly', label: 'Monthly' },
];

const MEDAL = {
  1: { emoji: '🥇', ring: 'ring-amber-400',  bg: 'bg-amber-50',    text: 'text-amber-600' },
  2: { emoji: '🥈', ring: 'ring-slate-300',  bg: 'bg-slate-50',    text: 'text-slate-500' },
  3: { emoji: '🥉', ring: 'ring-orange-300', bg: 'bg-orange-50',   text: 'text-orange-500' },
};

const SCORE_COL = {
  leetcode: { lc: true,  gh: false, tot: false },
  github:   { lc: false, gh: true,  tot: false },
  combined: { lc: true,  gh: true,  tot: true  },
};

// ── Filter toggle ─────────────────────────────────────────────────────────────

function FilterGroup({ options, active, onChange, accent = 'indigo' }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            active === key
              ? accent === 'indigo'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Rank cell ─────────────────────────────────────────────────────────────────

function RankCell({ rank }) {
  if (MEDAL[rank]) {
    return (
      <div className="flex items-center justify-center w-9 h-9 text-xl">
        {MEDAL[rank].emoji}
      </div>
    );
  }
  return (
    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
      {rank}
    </div>
  );
}

// ── Score cell ────────────────────────────────────────────────────────────────

function ScoreCell({ value, isTotal, dimmed }) {
  if (dimmed) return <td className="py-4 px-4 text-center text-sm text-slate-300">—</td>;
  return (
    <td className={cn('py-4 px-4 text-center text-sm font-semibold', isTotal ? 'text-indigo-600' : 'text-slate-700')}>
      {formatNumber(value)}
    </td>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function LeaderboardRow({ entry, cols, isMe }) {
  const medal = MEDAL[entry.rank];
  return (
    <tr
      className={cn(
        'border-b transition-colors',
        isMe
          ? 'bg-indigo-50/70 border-indigo-100'
          : medal
          ? cn('border-slate-100', medal.bg)
          : 'border-slate-50 hover:bg-slate-50/60',
      )}
    >
      <td className="py-3 pl-5 pr-3">
        <RankCell rank={entry.rank} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className={cn('h-9 w-9 shrink-0', medal ? `ring-2 ${medal.ring}` : isMe ? 'ring-2 ring-indigo-400' : '')}>
              <AvatarImage src={entry.avatarUrl} alt={entry.name} />
              <AvatarFallback className="text-xs">{entry.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className={cn('text-sm font-semibold', isMe ? 'text-indigo-700' : 'text-slate-900')}>
              {entry.name} {isMe && <span className="text-xs font-normal text-indigo-400">(You)</span>}
            </p>
            <p className="text-xs text-slate-400">{entry.branch} · Batch {entry.batch}</p>
          </div>
        </div>
      </td>
      <ScoreCell value={entry.leetcodeScore} dimmed={!cols.lc} />
      <ScoreCell value={entry.githubScore}   dimmed={!cols.gh} />
      <ScoreCell value={entry.totalScore}    isTotal />
    </tr>
  );
}

// ── Your rank footer row ──────────────────────────────────────────────────────

function YourRankRow({ you, cols }) {
  return (
    <tr className="bg-slate-900 text-white">
      <td className="py-4 pl-5 pr-3">
        <div className="flex flex-col items-center">
          <Star size={13} className="text-indigo-200 mb-0.5" />
          <span className="text-xs text-indigo-200 font-medium leading-none">Your</span>
          <span className="text-xs text-indigo-200 font-medium leading-none">Rank</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {you.rank}
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-white/40">
              <AvatarImage src={you.avatarUrl} alt={you.name} />
              <AvatarFallback className="text-xs bg-indigo-400 text-white">{you.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-white">You</p>
              <p className="text-xs text-indigo-200">{you.name}</p>
            </div>
          </div>
        </div>
      </td>
      <td className={cn('py-4 px-4 text-center text-sm font-semibold', cols.lc ? 'text-white' : 'text-indigo-300/50')}>
        {cols.lc ? formatNumber(you.leetcodeScore) : '—'}
      </td>
      <td className={cn('py-4 px-4 text-center text-sm font-semibold', cols.gh ? 'text-white' : 'text-indigo-300/50')}>
        {cols.gh ? formatNumber(you.githubScore) : '—'}
      </td>
      <td className="py-4 px-4 text-center text-sm font-bold text-yellow-300">{formatNumber(you.totalScore)}</td>
    </tr>
  );
}

// ── Summary cards ─────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, iconBg, label, value, sub }) {
  return (
    <Card className="p-4 shadow-none">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
          <Icon size={16} className="text-black" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

// ── Immersion Podium (top 3) ──────────────────────────────────────────────────

const PODIUM = {
  1: { order: 'order-2', height: 'h-28', bg: 'bg-amber-400',   ring: 'ring-amber-400',  label: '🥇', textColor: 'text-amber-700'  },
  2: { order: 'order-1', height: 'h-20', bg: 'bg-slate-300',   ring: 'ring-slate-300',  label: '🥈', textColor: 'text-slate-600'  },
  3: { order: 'order-3', height: 'h-14', bg: 'bg-orange-300',  ring: 'ring-orange-300', label: '🥉', textColor: 'text-orange-600' },
};

function ImmersionPodium({ top3 }) {
  return (
    <div className="flex items-end justify-center gap-4 pt-6 pb-2">
      {top3.map((s) => {
        const p = PODIUM[s.rank];
        return (
          <div key={s._id} className={cn('flex flex-col items-center gap-2', p.order)}>
            <div className="text-xl">{p.label}</div>
            <Avatar className={cn('h-14 w-14 ring-4', p.ring)}>
              <AvatarImage src={s.avatarUrl} alt={s.name} />
              <AvatarFallback className="text-lg">{s.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 max-w-[90px] truncate">{s.name}</p>
              <p className="text-xs text-slate-500">{s.branch}</p>
              <p className={cn('text-lg font-black mt-0.5', p.textColor)}>{s.marks}<span className="text-xs font-semibold text-slate-400">/100</span></p>
            </div>
            <div className={cn('w-20 rounded-t-xl flex items-center justify-center', p.height, p.bg)}>
              <span className="text-white font-black text-xl">#{s.rank}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Immersion Around-You Row ──────────────────────────────────────────────────

function ImmersionRow({ entry }) {
  const isMe = !!entry.isMe;
  const medal = MEDAL[entry.rank];
  const gradeColor = entry.grade === 'Good' ? 'text-emerald-600 bg-emerald-50' : entry.grade === 'Average' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
  const statusColor = entry.status === 'Pass' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <tr className={cn(
      'border-b transition-colors',
      isMe ? 'bg-indigo-50/80 border-indigo-200' : medal ? cn('border-slate-100', medal.bg) : 'border-slate-50 hover:bg-slate-50/60',
    )}>
      <td className="py-3 pl-5 pr-3">
        <RankCell rank={entry.rank} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar className={cn('h-9 w-9 shrink-0', medal ? `ring-2 ${medal.ring}` : isMe ? 'ring-2 ring-indigo-400' : '')}>
            <AvatarImage src={entry.avatarUrl} alt={entry.name} />
            <AvatarFallback className="text-xs">{entry.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className={cn('text-sm font-semibold', isMe ? 'text-indigo-700' : 'text-slate-900')}>
              {entry.name} {isMe && <span className="text-xs font-normal text-indigo-400">(You)</span>}
            </p>
            <p className="text-xs text-slate-400">{entry.branch}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={cn('text-sm font-bold', isMe ? 'text-indigo-700' : 'text-slate-800')}>{entry.marks}<span className="text-xs font-normal text-slate-400">/100</span></span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', statusColor)}>{entry.status}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', gradeColor)}>{entry.grade}</span>
      </td>
    </tr>
  );
}

// ── Week filter pills ─────────────────────────────────────────────────────────

function WeekPills({ selectedWeek, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide shrink-0">Week</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {IMMERSION_WEEKS.map(({ week, label, topic }) => (
          <button
            key={week}
            onClick={() => onChange(week)}
            title={topic}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border',
              selectedWeek === week
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Immersion View ────────────────────────────────────────────────────────────

function ImmersionView() {
  const [selectedWeek, setSelectedWeek] = useState(12);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getImmersionLeaderboard(selectedWeek).then((d) => { setData(d); setLoading(false); });
  }, [selectedWeek]);

  const weekMeta = data?.weekMeta ?? IMMERSION_WEEKS.find((w) => w.week === selectedWeek) ?? IMMERSION_WEEKS[IMMERSION_WEEKS.length - 1];

  return (
    <div className="space-y-6">
      <WeekPills selectedWeek={selectedWeek} onChange={setSelectedWeek} />

      {loading || !data ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading results…</p>
          </div>
        </div>
      ) : (() => {
        const { top3, around, me, total } = data;
        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard icon={Users}    label="Total Appeared"  value={total}              sub={weekMeta.label} />
              <SummaryCard icon={Trophy}   label="Your Rank"       value={`#${me?.rank}`}     sub={`of ${total}`} />
              <SummaryCard icon={BookOpen} label="Your Score"      value={`${me?.marks}/100`} sub={me?.grade} />
            </div>

            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Top 3 — {weekMeta.label} Immersion</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Topic: {weekMeta.topic}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ImmersionPodium top3={top3} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-sm font-semibold text-slate-700">Around You — Your Neighbourhood</p>
                <p className="text-xs text-slate-400 mt-0.5">Showing students ranked near your position</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-100">
                    <tr>
                      <th className="text-xs text-slate-500 font-semibold uppercase tracking-wide py-3 pl-5 pr-3 text-left w-14">Rank</th>
                      <th className="text-xs text-slate-500 font-semibold uppercase tracking-wide py-3 px-4 text-left">Name</th>
                      <th className="text-xs text-slate-500 font-semibold uppercase tracking-wide py-3 px-4 text-center">Marks</th>
                      <th className="text-xs text-slate-500 font-semibold uppercase tracking-wide py-3 px-4 text-center">Status</th>
                      <th className="text-xs text-slate-500 font-semibold uppercase tracking-wide py-3 px-4 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {around.map((entry) => (
                      <ImmersionRow key={entry._id} entry={entry} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5"><span className="text-base">🥇</span> 1st Place</div>
              <div className="flex items-center gap-1.5"><span className="text-base">🥈</span> 2nd Place</div>
              <div className="flex items-center gap-1.5"><span className="text-base">🥉</span> 3rd Place</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Your position</div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const Leaderboard = () => {
  const [platform, setPlatform] = useState('leetcode');
  const [time,     setTime]     = useState('weekly');
  const [search,   setSearch]   = useState('');
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [sortKey,  setSortKey]  = useState('rank');
  const [sortDir,  setSortDir]  = useState('asc');

  const load = useCallback(async (p, t) => {
    if (p === 'immersion') return;
    setLoading(true);
    try {
      setData(await getLeaderboard(p, t));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(platform, time); }, [platform, time, load]);

  const cols = SCORE_COL[platform] ?? SCORE_COL.leetcode;

  const primaryScoreKey = platform === 'github' ? 'githubScore' : platform === 'leetcode' ? 'leetcodeScore' : 'totalScore';

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'rank' ? 'asc' : 'desc'); }
  };

  const filtered = useMemo(() => {
    if (!data?.rows) return [];
    let rows = [...data.rows];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.branch.toLowerCase().includes(q) || r.batch.includes(q));
    }
    rows.sort((a, b) => {
      const v = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'rank') return (a.rank - b.rank) * v;
      return ((b[sortKey] ?? 0) - (a[sortKey] ?? 0)) * v;
    });
    return rows;
  }, [data, search, sortKey, sortDir]);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="ml-1 text-slate-300">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const thCls = 'text-xs text-slate-500 font-semibold uppercase tracking-wide py-3 select-none';

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Trophy size={20} className="text-slate-900" />
            <h1 className="text-xl font-bold text-slate-900">Leaderboard</h1>
          </div>
          <p className="text-sm text-slate-500">Compete and improve every day.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Platform</p>
            <FilterGroup options={PLATFORMS} active={platform} onChange={setPlatform} accent="indigo" />
          </div>
          {platform !== 'immersion' && (
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Time</p>
              <FilterGroup options={TIMES} active={time} onChange={setTime} accent="slate" />
            </div>
          )}
        </div>
      </div>

      {platform === 'immersion' ? (
        <ImmersionView />
      ) : (
        <>
          {(() => {
            if (loading || !data) {
              return (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading leaderboard…</p>
                  </div>
                </div>
              );
            }

            const { rows, you } = data;
            const yourEntry = rows.find((r) => r.isMe);
            const youInTable = !!yourEntry && (!search || yourEntry.name.toLowerCase().includes(search.toLowerCase()));
            const timeLabel = time === 'weekly' ? 'This Week' : 'This Month';
            const platformLabel = PLATFORMS.find((p) => p.key === platform)?.label;

            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <SummaryCard icon={Users}      label="Total Participants" value={rows.length + 20}              sub={timeLabel} />
                  <SummaryCard icon={Trophy}     label="Your Rank"          value={`#${you.rank}`}                sub={`of ${rows.length + 20}`} />
                  <SummaryCard icon={Star}       label="Your Score"         value={formatNumber(you.totalScore)}  sub={platformLabel} />
                  <SummaryCard icon={TrendingUp} label="Top Score"          value={formatNumber(rows[0]?.totalScore ?? 0)} sub={rows[0]?.name} />
                </div>

                <div className="relative max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, branch, batch…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                  />
                </div>

                <Card className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-slate-100 bg-slate-50/60">
                        <tr>
                          <th className={cn(thCls, 'pl-5 pr-3 text-left w-14 cursor-pointer')} onClick={() => handleSort('rank')}>
                            Rank <SortIcon col="rank" />
                          </th>
                          <th className={cn(thCls, 'px-4 text-left')}>Name</th>
                          <th className={cn(thCls, 'px-4 text-center cursor-pointer', cols.lc ? '' : 'text-slate-300')} onClick={() => cols.lc && handleSort('leetcodeScore')}>
                            LeetCode Score {cols.lc && <SortIcon col="leetcodeScore" />}
                          </th>
                          <th className={cn(thCls, 'px-4 text-center cursor-pointer', cols.gh ? '' : 'text-slate-300')} onClick={() => cols.gh && handleSort('githubScore')}>
                            GitHub Score {cols.gh && <SortIcon col="githubScore" />}
                          </th>
                          <th className={cn(thCls, 'px-4 text-center cursor-pointer text-indigo-600')} onClick={() => handleSort('totalScore')}>
                            Total Score <SortIcon col="totalScore" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                              No results found for "{search}"
                            </td>
                          </tr>
                        ) : (
                          filtered.map((entry) => (
                            <LeaderboardRow key={entry._id} entry={entry} cols={cols} isMe={!!entry.isMe} />
                          ))
                        )}
                      </tbody>
                      {!youInTable && (
                        <tfoot>
                          <YourRankRow you={you} cols={cols} />
                        </tfoot>
                      )}
                    </table>
                  </div>
                  {youInTable && you.rank > 5 && (
                    <div className="border-t border-indigo-100 bg-indigo-600">
                      <table className="w-full">
                        <tbody>
                          <YourRankRow you={you} cols={cols} />
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1.5"><span className="text-base">🥇</span> 1st Place</div>
                  <div className="flex items-center gap-1.5"><span className="text-base">🥈</span> 2nd Place</div>
                  <div className="flex items-center gap-1.5"><span className="text-base">🥉</span> 3rd Place</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Your position</div>
                  <p className="text-slate-300">· Click column headers to sort</p>
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
