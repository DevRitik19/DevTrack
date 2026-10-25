import axios from 'axios';

// Normalize API base URL to prevent common production misconfigurations
// (e.g. missing /api suffix or trailing slashes in VITE_API_URL on Vercel)
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cleanBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
const baseURL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token if stored in localStorage (dual cookie + header support)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devtrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction and auto session cleanup on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // If unauthorized on protected routes (not initial me-check or login attempts), signal session expiration
    if (status === 401 && !url.includes('/auth/me') && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      localStorage.removeItem('devtrack_token');
      window.dispatchEvent(new CustomEvent('devtrack-session-expired'));
    }

    const customError = {
      status,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors,
    };
    return Promise.reject(customError);
  }
);

export default api;
