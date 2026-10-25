import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Terminal, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = 'demo@devtrack.io';
    const demoPassword = 'password123';
    setFormData({
      email: demoEmail,
      password: demoPassword,
    });

    try {
      setLoading(true);
      await login(demoEmail, demoPassword);
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.message || 'Demo login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0E6] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E3D5BD] flex items-center justify-center text-[#B65F3B] mb-3 shadow-sm">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#263524]">
            Welcome to DevTrack
          </h1>
          <p className="text-sm text-[#6E7167] mt-1 font-mono">
            Sign in to access your developer progress hub
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E3D5BD] rounded-xl p-6 sm:p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#292C25] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
                  placeholder="developer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Mail className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#292C25] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Lock className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="devtrack-btn-primary w-full py-2.5 mt-2"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-5 pt-4 border-t border-[#E3D5BD] flex items-center justify-between text-xs gap-2">
            <span className="text-[#6E7167] font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#263524]" /> Need a demo account?
            </span>
            <button
              type="button"
              disabled={loading}
              onClick={handleDemoLogin}
              className="text-xs px-2.5 py-1 rounded bg-[#F4F0E6] hover:bg-[#EAE4D5] text-[#B65F3B] hover:text-[#9F4825] font-semibold font-mono border border-[#E3D5BD] transition-all disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in as Demo User →'}
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#6E7167] mt-6">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="text-[#B65F3B] hover:underline font-semibold"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
