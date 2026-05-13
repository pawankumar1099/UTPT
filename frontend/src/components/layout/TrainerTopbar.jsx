import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TrainerTopbar = ({ profile, onMenuClick }) => {
  return (
    <header className="sticky top-0 left-10 mt-5 z-10 glass-panel rounded-full w-[95%]">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={onMenuClick}
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-white/40 backdrop-blur-md"
          >
            <Menu className="h-5 w-5 text-black/60" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1d1d1f] truncate">
              Trainer Dashboard
            </h1>
            <p className="text-[11px] font-semibold text-black/40 uppercase tracking-wider">
              Monitor your students performance and help them improve.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          

         

          <button
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/40 bg-white/60 backdrop-blur-md hover:bg-white transition-all"
            style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.04)' }}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-black/60" />
          </button>

          <Avatar className="h-9 w-9 ring-1 ring-white/40 shadow-sm">
            <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
            <AvatarFallback>{profile?.name?.[0] ?? 'T'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default TrainerTopbar;
