import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Terminal, Lock, Mail, User, AtSign, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(formData.username.trim())) {
      addToast('Username can only contain letters, numbers, underscores, and hyphens (no spaces)', 'error');
      return;
    }

    if (formData.username.trim().length < 3) {
      addToast('Username must be at least 3 characters', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      await register({
        username: formData.username.trim().toLowerCase(),
        name: formData.name.trim() || formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      const specificError = err.errors?.[0]?.message || err.message || 'Registration failed';
      addToast(specificError, 'error');
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
            Create DevTrack Account
          </h1>
          <p className="text-sm text-[#6E7167] mt-1 font-mono">
            Track your coding journey in one unified place
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E3D5BD] rounded-xl p-6 sm:p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#292C25] mb-1.5">
                Username * (used for public profile URL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="devtrack-input devtrack-input-with-icon w-full pl-10 font-mono text-xs"
                  placeholder="e.g. alex_coder"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <AtSign className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#6E7167] mt-1 font-mono">
                No spaces. Letters, numbers, hyphens (-), and underscores (_) only.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#292C25] mb-1.5">
                Display Name (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
                  placeholder="Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <User className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#292C25] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Mail className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#292C25] mb-1.5">
                  Password *
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

              <div>
                <label className="block text-xs font-medium text-[#292C25] mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  <Lock className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="devtrack-btn-primary w-full py-2.5 mt-2"
            >
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#6E7167] mt-6">
          Already registered?{' '}
          <Link
            to="/login"
            className="text-[#B65F3B] hover:underline font-semibold"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
