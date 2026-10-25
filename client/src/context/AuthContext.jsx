import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const checkAuth = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('devtrack_token');
        setUser(null);
      }
    } catch (err) {
      // 401 is normal if not logged in
      localStorage.removeItem('devtrack_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for global session expiration events (e.g. 401 on protected requests)
  useEffect(() => {
    const handleExpired = () => {
      localStorage.removeItem('devtrack_token');
      setUser(null);
      addToast('Your session has expired. Please sign in again.', 'warning');
    };

    window.addEventListener('devtrack-session-expired', handleExpired);
    return () => window.removeEventListener('devtrack-session-expired', handleExpired);
  }, [addToast]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.user) {
      if (res.token) {
        localStorage.setItem('devtrack_token', res.token);
      }
      setUser(res.user);
      addToast(`Welcome back, ${res.user.name || res.user.username}!`, 'success');
      return res.user;
    }
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.user) {
      if (res.token) {
        localStorage.setItem('devtrack_token', res.token);
      }
      setUser(res.user);
      addToast(`Account created successfully! Welcome to DevTrack, ${res.user.username}.`, 'success');
      return res.user;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('devtrack_token');
      setUser(null);
      addToast('You have been logged out', 'info');
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUserData,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateUser,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
