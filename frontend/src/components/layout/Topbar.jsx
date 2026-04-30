import React from 'react';
import { Bell, Flame, Menu, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Topbar = ({ profile, streak = 0, unreadNotifications = 0 }) => {
  return (
    <header className="sticky top-0 z-10 glass-panel ">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-white/40 backdrop-blur-md">
            <Menu className="h-5 w-5 text-black/60" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1d1d1f] truncate">
              Welcome back, {profile?.name?.split(' ')[0] ?? 'Student'}!{' '}
              <span aria-hidden>👋</span>
            </h1>
            <p className="text-[11px] font-semibold text-black/40 uppercase tracking-wider">Keep coding, keep growing!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="hidden md:flex items-center gap-2 rounded-xl border border-white/40 bg-white/40 backdrop-blur-md px-3 py-1.5 w-64 focus-within:bg-white transition-all"
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
          >
            <Search className="h-4 w-4 text-black/30" />
            <input
              placeholder="Search..."
              className="bg-transparent w-full text-xs font-medium placeholder:text-black/30 focus:outline-none"
            />
          </div>

          <div 
            className="flex items-center gap-2 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 px-3 py-1.5 transition-transform hover:scale-105 cursor-default"
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
          >
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10" />
            <div className="leading-tight">
              <p className="text-xs font-black text-[#1d1d1f]">{streak}</p>
              <p className="text-[9px] text-black/40 font-bold uppercase tracking-tighter">Streak</p>
            </div>
          </div>

          <button
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/40 bg-white/60 backdrop-blur-md hover:bg-white transition-all"
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-black/60" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border border-white shadow-sm">
                {unreadNotifications}
              </span>
            )}
          </button>

          <Avatar className="h-9 w-9 ring-1 ring-white/40 shadow-sm">
            <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
            <AvatarFallback>{profile?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
