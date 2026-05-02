import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerTopbar from './TrainerTopbar';
import { useTrainerDashboard } from '@/hooks/useTrainerDashboard';

const TrainerLayout = () => {
  const { data, loading, error } = useTrainerDashboard();
  const profile = data?.profile;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <TrainerSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerTopbar profile={profile} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto scrollbar-thin">
          <Outlet context={{ data, loading, error }} />
        </main>
      </div>
    </div>
  );
};

export default TrainerLayout;
