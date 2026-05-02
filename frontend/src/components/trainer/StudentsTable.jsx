import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getStudents } from '@/services/trainer.service';

const PAGE_SIZE = 20;

const filters = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'top', label: 'Top Performers' },
  { value: 'at-risk', label: 'At-Risk' },
];

const StatusBadge = ({ status }) => (
  <span
    className={cn(
      'px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
      status === 'Active'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-rose-50 text-rose-700 border-rose-200',
    )}
  >
    {status}
  </span>
);

const formatLastActive = (iso) => {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

const StudentsTable = ({ onViewStudent }) => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      // Future: replace getStudents() with api.get('/trainer/students', { params })
      const res = await getStudents({ page, limit: PAGE_SIZE, search, filter });
      setRows(res.rows);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Problems Solved', 'Streak', 'GitHub Commits', 'Score', 'Status', 'Last Active'];
    const csv = [
      headers.join(','),
      ...rows.map((s) =>
        [s.name, s.email, s.problemsSolved, s.streak, s.githubCommits, s.score, s.status, formatLastActive(s.lastActive)].join(','),
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Students Overview</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 w-48">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="bg-transparent text-xs w-full focus:outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                {filters.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">
                  Student
                </th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                  Problems
                </th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                  Streak
                </th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                  GitHub
                </th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                  Score
                </th>
                <th className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                  Status
                </th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden lg:table-cell">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No students found.
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => onViewStudent?.(s)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-1 ring-slate-100 shrink-0">
                          <AvatarImage src={s.avatarUrl} alt={s.name} />
                          <AvatarFallback>{s.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[140px]">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-700">
                      {s.problemsSolved}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400/20" />
                        <span className="font-semibold text-slate-700">{s.streak}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-700 hidden md:table-cell">
                      {s.githubCommits}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                      {s.score.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 text-xs hidden lg:table-cell">
                      {formatLastActive(s.lastActive)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Showing {rows.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to{' '}
            {Math.min(page * PAGE_SIZE, total)} of {total} students
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-7 w-7 rounded-lg text-xs font-semibold transition-colors',
                    page === p
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
