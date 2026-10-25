import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  User,
  Shield,
  Eye,
  KeyRound,
  Plus,
  X,
  Globe,
  Check,
} from 'lucide-react';
import { Github } from '../components/common/Icons';

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    githubUsername: user?.githubUsername || '',
  });

  // Skills
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    isPublic: user?.publicProfileSettings?.isPublic ?? true,
    showSkills: user?.publicProfileSettings?.showSkills ?? true,
    showGitHub: user?.publicProfileSettings?.showGitHub ?? true,
    showLeetCode: user?.publicProfileSettings?.showLeetCode ?? true,
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        githubUsername: user.githubUsername || '',
      });
      setSkills(user.skills || []);
      setPrivacySettings({
        isPublic: user.publicProfileSettings?.isPublic ?? true,
        showSkills: user.publicProfileSettings?.showSkills ?? true,
        showGitHub: user.publicProfileSettings?.showGitHub ?? true,
        showLeetCode: user.publicProfileSettings?.showLeetCode ?? true,
      });
    }
  }, [user]);

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfileAndPrivacy = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const payload = {
        name: profileForm.name.trim(),
        bio: profileForm.bio.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
        githubUsername: profileForm.githubUsername.trim(),
        skills,
        publicProfileSettings: privacySettings,
      };

      const res = await usersApi.updateProfile(payload);
      if (res.success) {
        updateUser(res.user);
        addToast('Profile and privacy settings saved successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      addToast('Please enter both current and new passwords', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await usersApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.success) {
        addToast('Password changed successfully!', 'success');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (err) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#263524] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#B65F3B]" /> Account & Profile Settings
        </h1>
        <p className="text-xs text-text-muted mt-0.5 font-mono">
          Manage your public developer profile, privacy settings, and credentials
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfileAndPrivacy} className="space-y-6">
        {/* Profile Card */}
        <div className="devtrack-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2 border-b border-[#E3D5BD] pb-3">
            <User className="w-4 h-4 text-[#263524]" /> Developer Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                className="devtrack-input w-full"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                GitHub Username
              </label>
              <input
                type="text"
                className="devtrack-input w-full font-mono text-xs"
                placeholder="e.g. torvalds"
                value={profileForm.githubUsername}
                onChange={(e) => setProfileForm({ ...profileForm, githubUsername: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              className="devtrack-input w-full text-xs font-mono"
              placeholder="https://..."
              value={profileForm.avatarUrl}
              onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Bio / Summary (Max 300 characters)
            </label>
            <textarea
              rows="3"
              className="devtrack-input w-full resize-none text-xs"
              placeholder="Full stack software engineer passionate about distributed systems and React..."
              value={profileForm.bio}
              maxLength={300}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            />
          </div>

          {/* Technical Skills */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Technical Stack & Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="devtrack-input flex-1 text-xs"
                placeholder="Add skill (e.g. TypeScript, Express, GraphQL)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="devtrack-btn-secondary text-xs px-3"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EAE2D3] text-[#292C25] text-xs font-mono rounded-md border border-[#E3D5BD]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-[#6E7167] hover:text-[#C24137] p-0.5 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy & Visibility Settings Card */}
        <div className="devtrack-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2 border-b border-[#E3D5BD] pb-3">
            <Eye className="w-4 h-4 text-[#B65F3B]" /> Public Profile Privacy Controls
          </h2>
          <p className="text-xs text-text-muted">
            Configure what visitors see when they navigate to your public developer portfolio at{' '}
            <span className="font-mono text-[#B65F3B] font-semibold">/u/{user?.username}</span>
          </p>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF6EE] border border-[#E3D5BD] cursor-pointer">
              <div>
                <span className="text-xs font-medium text-[#292C25] block">
                  Enable Public Profile
                </span>
                <span className="text-[11px] text-text-muted">
                  Allow anyone with your link to view your public developer portfolio
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.isPublic}
                onChange={(e) =>
                  setPrivacySettings({ ...privacySettings, isPublic: e.target.checked })
                }
                className="w-4 h-4 rounded border-[#E3D5BD] text-[#B65F3B] accent-[#B65F3B] focus:ring-[#B65F3B] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF6EE] border border-[#E3D5BD] cursor-pointer">
              <div>
                <span className="text-xs font-medium text-[#292C25] block">
                  Display Skills & Technologies
                </span>
                <span className="text-[11px] text-text-muted">
                  Show your technical badges on your public profile
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.showSkills}
                onChange={(e) =>
                  setPrivacySettings({ ...privacySettings, showSkills: e.target.checked })
                }
                className="w-4 h-4 rounded border-[#E3D5BD] text-[#B65F3B] accent-[#B65F3B] focus:ring-[#B65F3B] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF6EE] border border-[#E3D5BD] cursor-pointer">
              <div>
                <span className="text-xs font-medium text-[#292C25] block">
                  Display GitHub Profile Link
                </span>
                <span className="text-[11px] text-text-muted">
                  Include external link to your GitHub account
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.showGitHub}
                onChange={(e) =>
                  setPrivacySettings({ ...privacySettings, showGitHub: e.target.checked })
                }
                className="w-4 h-4 rounded border-[#E3D5BD] text-[#B65F3B] accent-[#B65F3B] focus:ring-[#B65F3B] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF6EE] border border-[#E3D5BD] cursor-pointer">
              <div>
                <span className="text-xs font-medium text-[#292C25] block">
                  Display LeetCode Metrics
                </span>
                <span className="text-[11px] text-text-muted">
                  Show verified problem counts on your public profile
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.showLeetCode}
                onChange={(e) =>
                  setPrivacySettings({ ...privacySettings, showLeetCode: e.target.checked })
                }
                className="w-4 h-4 rounded border-[#E3D5BD] text-[#B65F3B] accent-[#B65F3B] focus:ring-[#B65F3B] cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="devtrack-btn-primary text-xs"
            >
              {savingProfile ? 'Saving...' : 'Save Profile & Privacy Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* Security & Password Card */}
      <div className="devtrack-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2 border-b border-[#E3D5BD] pb-3">
          <KeyRound className="w-4 h-4 text-[#263524]" /> Security & Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              className="devtrack-input w-full"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                New Password (Min 6 characters)
              </label>
              <input
                type="password"
                className="devtrack-input w-full"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                className="devtrack-input w-full"
                placeholder="••••••••"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="devtrack-btn-secondary text-xs"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
