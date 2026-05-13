import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';
import TrainerLayout from '@/components/layout/TrainerLayout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/student/Dashboard';
import Coding from '@/pages/student/Coding';
import Github from '@/pages/student/Github';
import Leaderboard from '@/pages/student/Leaderboard';
import Profile from '@/pages/student/Profile';
import Notifications from '@/pages/student/Notifications';
import Settings from '@/pages/student/Settings';
import TrainerDashboard from '@/pages/trainer/Dashboard';
import TrainerStudents from '@/pages/trainer/Students';
import TrainerActivity from '@/pages/trainer/Activity';
import TrainerTopPerformers from '@/pages/trainer/TopPerformers';
import TrainerAtRisk from '@/pages/trainer/AtRisk';
import TrainerImmersion from '@/pages/trainer/Immersion';
import AdminDashboard from '@/pages/admin/Dashboard';
import NotFound from '@/pages/NotFound';

// ── Auth initializer ──────────────────────────────────────────────────────────
function AuthInit({ children }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const initializing = useAuthStore((s) => s.initializing);

  useEffect(() => { initAuth(); }, [initAuth]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  return children;
}

// ── Protected route ───────────────────────────────────────────────────────────
function RequireAuth({ role, children }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'trainer' ? '/trainer' : '/dashboard'} replace />;
  }
  return children;
}

// ── Root redirect ─────────────────────────────────────────────────────────────
function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'trainer' ? '/trainer' : '/dashboard'} replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthInit>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student routes */}
          <Route
            path="/"
            element={
              <RequireAuth role="student">
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="coding"        element={<Coding />} />
            <Route path="github"        element={<Github />} />
            <Route path="leaderboard"   element={<Leaderboard />} />
            <Route path="profile"       element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings"      element={<Settings />} />
            <Route path="admin"         element={<AdminDashboard />} />
          </Route>

          {/* Trainer routes */}
          <Route
            path="/trainer"
            element={
              <RequireAuth role="trainer">
                <TrainerLayout />
              </RequireAuth>
            }
          >
            <Route index              element={<TrainerDashboard />} />
            <Route path="students"    element={<TrainerStudents />} />
            <Route path="activity"    element={<TrainerActivity />} />
            <Route path="top"         element={<TrainerTopPerformers />} />
            <Route path="at-risk"     element={<TrainerAtRisk />} />
            <Route path="immersion"   element={<TrainerImmersion />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthInit>
    </Router>
  );
}

export default App;
