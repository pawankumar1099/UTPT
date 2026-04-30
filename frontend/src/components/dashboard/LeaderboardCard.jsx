import React from 'react';
import { Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, formatNumber } from '@/lib/utils';

const RankBadge = ({ rank }) => {
  const styles = {
    1: 'bg-amber-400 text-white',
    2: 'bg-slate-300 text-slate-800',
    3: 'bg-orange-400 text-white',
  };
  return (
    <span
      className={cn(
        'absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white',
        styles[rank] ?? 'bg-slate-200 text-slate-700',
      )}
    >
      {rank}
    </span>
  );
};

const LeaderboardCard = ({ leaderboard }) => {
  if (!leaderboard) return null;
  const top = [...leaderboard.top].sort((a, b) => a.rank - b.rank);
  // Order so #1 is centered: [#2, #1, #3]
  const podium = [top.find((u) => u.rank === 2), top.find((u) => u.rank === 1), top.find((u) => u.rank === 3)].filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-around gap-2 pt-2">
          {podium.map((user) => (
            <div key={user._id} className="flex flex-col items-center text-center">
              <div className="relative">
                {user.rank === 1 && (
                  <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 h-5 w-5 text-amber-400" />
                )}
                <Avatar
                  className={cn(
                    'h-14 w-14 ring-2',
                    user.rank === 1
                      ? 'ring-amber-400 h-16 w-16'
                      : user.rank === 2
                        ? 'ring-slate-300'
                        : 'ring-orange-300',
                  )}
                >
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <RankBadge rank={user.rank} />
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-2 truncate max-w-[8rem]">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">{formatNumber(user.score)}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-indigo-50/60 border border-indigo-100 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-full bg-[#0A121A] text-white text-xs font-bold flex items-center justify-center">
              {leaderboard.you.rank}
            </span>
            <div>
              <p className="text-xs text-slate-500">You</p>
              <p className="text-sm font-semibold text-slate-900">{leaderboard.you.name}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-[#0A121A]">{formatNumber(leaderboard.you.score)}</p>
        </div>

        <Button variant="gradient" className="w-full bg-[#0A121A]">
          View Full Leaderboard
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
