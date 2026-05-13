import React, { useState } from 'react';
import { Outlet, useOutletContext, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/store/authStore';
import navLogo from '@/assets/navLogo.png';

const Layout = () => {
  const { data, loading, error } = useDashboard();
  const profile = data?.profile;
  const streak = data?.stats?.currentStreak ?? 0;
  const unread = data?.notifications?.filter((n) => !n.read).length ?? 0;

  const viewingStudent = useAuthStore((s) => s.viewingStudent);
  const clearViewingStudent = useAuthStore((s) => s.clearViewingStudent);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleExitView = () => {
    clearViewingStudent();
    navigate('/trainer');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
    {/* <div  className=" flex gap-8 items-center absolute top-6 left-8 z-50  w-10" ><img src={navLogo} alt="Logo"/><span className='text-sm text-nowrap text-slate-500'>Student Dashboard</span></div> */}
    
      <Sidebar profile={profile} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {viewingStudent && (
          <div className="shrink-0 flex items-center justify-between gap-3 bg-indigo-600 text-white px-4 sm:px-6 lg:px-8 py-2 text-sm">
            <span>
              Viewing dashboard as <strong>{viewingStudent.name}</strong>
            </span>
            <button
              onClick={handleExitView}
              className="shrink-0 rounded-md bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-semibold transition-colors"
            >
              ← Exit student view
            </button>
          </div>
        )}
        <Topbar profile={profile} streak={streak} unreadNotifications={unread} onMenuClick={toggleMobileMenu} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto scrollbar-thin">
          <Outlet context={{ data, loading, error }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
