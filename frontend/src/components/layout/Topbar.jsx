import React from 'react';
import { Bell, Flame, Menu, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';

const Topbar = ({ profile, streak = 0, unreadNotifications = 0 }) => {
  const theme = useAuthStore((s) => s.theme);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);

  return (
    <header className="sticky top-0 z-10 glass-panel dark:border-white/5">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 backdrop-blur-md">
            <Menu className="h-5 w-5 text-black/60 dark:text-white/60" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-slate-100 truncate">
              Welcome back, {profile?.name?.split(' ')[0] ?? 'Student'}!{' '}
              <span aria-hidden>👋</span>
            </h1>
            <p className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">Keep coding, keep growing!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 px-3 py-1.5 transition-transform hover:scale-105 cursor-default"
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
          >
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10" />
            <div className="leading-tight">
              <p className="text-xs font-black text-[#1d1d1f] dark:text-slate-100">{streak}</p>
              <p className="text-[9px] text-black/40 dark:text-white/40 font-bold uppercase tracking-tighter">Streak</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all"
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun className="h-4 w-4 text-amber-400" />
              : <Moon className="h-4 w-4 text-slate-600" />
            }
          </button>

          <button
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all"
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-black/60 dark:text-white/60" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border border-white shadow-sm">
                {unreadNotifications}
              </span>
            )}
          </button>

          <Avatar className="h-9 w-9 ring-1 ring-white/40 shadow-sm">
            <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
            <AvatarFallback className="dark:bg-slate-700 dark:text-slate-200">{profile?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
