import React from 'react';
import { Bell, Flame, Menu, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Topbar = ({ profile, streak = 0, unreadNotifications = 0 }) => {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200/70">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
              Welcome back, {profile?.name?.split(' ')[0] ?? 'Student'}!{' '}
              <span aria-hidden>👋</span>
            </h1>
            <p className="text-sm text-slate-500 truncate">Keep coding, keep growing!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 w-72">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search problems, repos, students..."
              className="bg-transparent w-full text-sm placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-100 px-3 py-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-orange-600">{streak}</p>
              <p className="text-[10px] text-orange-500/80 font-medium">Day Streak</p>
            </div>
          </div>

          <button
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-slate-600" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          <Avatar className="h-10 w-10 ring-2 ring-white shadow">
            <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
            <AvatarFallback>{profile?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
