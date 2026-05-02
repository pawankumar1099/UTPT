import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AtRiskStudents = ({ students, onViewStudent }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>At-Risk Students</CardTitle>
          <button className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {students?.map((s) => (
          <button
            key={s._id}
            onClick={() => onViewStudent?.(s)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50/60 transition-colors text-left group"
          >
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-rose-100">
              <AvatarImage src={s.avatarUrl} alt={s.name} />
              <AvatarFallback>{s.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-rose-600 transition-colors">
                {s.name}
              </p>
              <p className="text-[11px] text-slate-400">{s.riskReason}</p>
            </div>
            <span className="text-[11px] font-semibold text-rose-500 shrink-0 whitespace-nowrap">
              {s.inactiveDays} days inactive
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default AtRiskStudents;
