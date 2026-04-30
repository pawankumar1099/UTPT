import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useDashboard } from '@/hooks/useDashboard';

const Layout = () => {
  const { data, loading, error } = useDashboard();
  const profile = data?.profile;
  const streak = data?.stats?.currentStreak ?? 0;
  const unread = data?.notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar profile={profile} streak={streak} unreadNotifications={unread} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto scrollbar-thin">
          <Outlet context={{ data, loading, error }} />
        </main>
      </div>
    </div>
  );
};

export const useLayoutData = () => useOutletContext();

export default Layout;
