import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  User,
  Trophy,
  Bell,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import GithubIcon from '@/components/icons/GithubIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/coding', label: 'Coding Progress', icon: Code2 },
  { to: '/github', label: 'GitHub Activity', icon: GithubIcon },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ profile }) => {
  return (
    <aside className="hidden lg:flex h-screen sticky top-0 w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight">UTPT</p>
          <p className="text-xs text-slate-400">Student Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-900/30'
                  : 'text-slate-300 hover:bg-sidebar-accent hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-white/5">
          <NavLink
            to="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-sidebar-accent hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </NavLink>
        </div>
      </nav>

      {profile && (
        <div className="m-3 p-3 rounded-xl bg-sidebar-accent/60 border border-white/5 flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-white/10">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback>{profile.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{profile.name}</p>
            <p className="text-xs text-slate-400 truncate">{profile.email}</p>
          </div>
          <span className="text-[10px] rounded-md bg-emerald-500/15 text-emerald-300 px-2 py-0.5 font-medium">
            Student
          </span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
