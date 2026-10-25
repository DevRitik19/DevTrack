import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { GoalsPage } from './pages/GoalsPage';
import { GitHubPage } from './pages/GitHubPage';
import { LeetCodePage } from './pages/LeetCodePage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { Terminal } from 'lucide-react';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F0E6] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-white border border-[#E3D5BD] flex items-center justify-center text-[#B65F3B] animate-pulse mb-3 shadow-sm">
          <Terminal className="w-5 h-5" />
        </div>
        <span className="text-xs font-mono text-[#6E7167]">Loading DevTrack workspace...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Only Route Guard (for login/register when already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return children;
};

export const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Profile Viewable by anyone */}
            <Route path="/u/:username" element={<PublicProfilePage />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Workspace Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="github" element={<GitHubPage />} />
              <Route path="leetcode" element={<LeetCodePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
