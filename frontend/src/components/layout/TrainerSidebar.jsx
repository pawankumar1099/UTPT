import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Trophy,
  AlertTriangle,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import navLogo from '@/assets/navLogo.png';
import arivanaLogo from '@/assets/arivanaLogo.png';

const navItems = [
  { to: '/trainer',            label: 'Overview',       icon: LayoutDashboard, end: true },
  { to: '/trainer/students',   label: 'Students',       icon: Users },
  { to: '/trainer/activity',   label: 'Activity',       icon: TrendingUp },
  { to: '/trainer/top',        label: 'Top Performers', icon: Trophy },
  { to: '/trainer/at-risk',    label: 'At-Risk',        icon: AlertTriangle },
  { to: '/trainer/immersion',  label: 'Immersion Exam', icon: BookOpen },
];

const TrainerSidebar = ({ profile, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out lg:relative lg:inset-auto lg:my-auto lg:ml-5 lg:sticky lg:h-[95%] lg:flex lg:glass-sidebar lg:rounded-xl text-[#1d1d1f]",
          isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 z-50 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-white/60 backdrop-blur-md text-[#1d1d1f] hover:bg-white transition-colors shadow-lg"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="pt-3 mt-3 border-t border-white/10">
                  <NavLink
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-black/60 hover:bg-white/40 hover:text-black transition-all",
                      isCollapsed && "lg:justify-center lg:px-0"
                    )}
                    title={isCollapsed ? "Logout" : ""}
                  >
                <img src={navLogo} alt="Logo" className='w-12 ml-2'/>
                    {(!isCollapsed || isMobileMenuOpen) && <span className='text-lg font-bold text-black font-body'>UTPT &nbsp;  <span className='text-sm text-muted-foreground font-thin'> |  &nbsp; Student</span></span>}
                  </NavLink>
                </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/80 border border-white/50 text-[#0071e3] shadow-glass-sm'
                    : 'text-black/60 hover:bg-white/40 hover:text-black',
                  isCollapsed && 'lg:justify-center lg:px-0',
                )
              }
              title={isCollapsed ? label : ''}
            >
              <Icon className="h-4 w-4 shrink-0 transition-transform active:scale-95" />
              {(!isCollapsed || isMobileMenuOpen) && <span className="truncate">{label}</span>}
            </NavLink>
          ))}

          <div className="pt-3 mt-3 border-t border-white/10">
            <NavLink
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-black/60 hover:bg-white/40 hover:text-black transition-all',
                isCollapsed && 'lg:justify-center lg:px-0',
              )}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {(!isCollapsed || isMobileMenuOpen) && <span>Logout</span>}
            </NavLink>
          </div>
        </nav>

        {profile && (
          <div
            className={cn(
              'm-3 p-3 rounded-2xl bg-white/40 border border-white/20 flex items-center transition-all duration-300',
              (isCollapsed && !isMobileMenuOpen) ? 'justify-center p-2' : 'gap-3',
            )}
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
          >
            <Avatar className="h-9 w-9 ring-1 ring-white/40 shadow-sm shrink-0">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback>{profile.name?.[0] ?? 'T'}</AvatarFallback>
            </Avatar>
            {(!isCollapsed || isMobileMenuOpen) && (
              <div className="min-w-0 flex-1 transition-opacity duration-300">
                <p className="text-sm font-bold tracking-tight text-[#1d1d1f] truncate">
                  {profile.name}
                </p>
                <p className="text-[10px] text-black/40 font-medium truncate">Trainer</p>
              </div>
            )}
          </div>
        )}

        
             <div className="pt-3 mt-3 border-t border-white/10 flex mx-auto">
                 <NavLink
                   to="/"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className={cn(
                     "flex items-center justify-center font-sans rounded-md px-3 py-2.5 text-sm font-medium text-black/60 hover:bg-white/40 hover:text-black transition-all",
                     (isCollapsed && !isMobileMenuOpen) && "justify-center px-0"
                   )}
                   title={isCollapsed ? "Logout" : ""}
                 >
               <img src={arivanaLogo} alt="Logo" className='w-12 '/>
                   {(!isCollapsed || isMobileMenuOpen) && <span className='text-lg font-bold text-black font-body'>Arivana</span>}
                 </NavLink>
               </div>
      </aside>
    </>
  );
};

export default TrainerSidebar;
