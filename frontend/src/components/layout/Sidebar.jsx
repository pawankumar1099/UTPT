import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import GithubIcon from '@/components/icons/GithubIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import navLogo from '@/assets/navLogo.png';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "hidden lg:flex h-screen sticky top-0 shrink-0 flex-col glass-sidebar text-[#1d1d1f] transition-all duration-300 ease-in-out relative z-30",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 z-50 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-white/60 backdrop-blur-md text-[#1d1d1f] hover:bg-white transition-colors shadow-lg"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 " />
        ) : (
          <ChevronLeft className="h-4 w-4 " />
        )}
      </button>

      <div className={cn(
        "flex items-center border-b border-white/10 transition-all duration-300",
        isCollapsed ? "px-4 py-6 justify-center" : "gap-3 px-6 py-6"
      )}>
        <div className="shrink-0">
          <img src={navLogo} alt="UTPT Logo" className={cn("h-8 w-auto transition-all contrast-125", isCollapsed && "scale-110")} />
        </div>
        {!isCollapsed && (
          <div className="transition-opacity duration-300 opacity-100">
            <p className="text-lg font-bold leading-tight tracking-tight">UTPT</p>
            <p className="text-[10px] font-semibold text-black/40 uppercase tracking-widest">Student Dashboard</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/80 border border-white/50 text-[#0071e3] shadow-glass-sm'
                  : 'text-black/60 hover:bg-white/40 hover:text-black',
                isCollapsed && "justify-center px-0"
              )
            }
            title={isCollapsed ? label : ""}
          >
            <Icon className="h-4 w-4 shrink-0 transition-transform active:scale-95" />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-white/10">
          <NavLink
            to="/login"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-black/60 hover:bg-white/40 hover:text-black transition-all",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </NavLink>
        </div>
      </nav>

      {profile && (
        <div 
          className={cn(
            "m-3 p-3 rounded-2xl bg-white/40 border border-white/20 flex items-center transition-all duration-300",
            isCollapsed ? "justify-center p-2" : "gap-3"
          )}
          style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
        >
          <Avatar className="h-9 w-9 ring-1 ring-white/40 shadow-sm shrink-0">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback>{profile.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 transition-opacity duration-300">
              <p className="text-sm font-bold tracking-tight text-[#1d1d1f] truncate">{profile.name}</p>
              <p className="text-[10px] text-black/40 font-medium truncate">{profile.email}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
