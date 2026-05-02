import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import TrainerStudentProfile from '@/pages/trainer/StudentProfile';
import AdminDashboard from '@/pages/admin/Dashboard';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="coding" element={<Coding />} />
          <Route path="github" element={<Github />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>

        {/* Trainer routes */}
        <Route path="/trainer" element={<TrainerLayout />}>
          <Route index element={<TrainerDashboard />} />
          <Route path="students" element={<TrainerStudents />} />
          <Route path="activity" element={<TrainerActivity />} />
          <Route path="top" element={<TrainerTopPerformers />} />
          <Route path="at-risk" element={<TrainerAtRisk />} />
          <Route path="immersion" element={<TrainerImmersion />} />
          <Route path="student/:studentId" element={<TrainerStudentProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
