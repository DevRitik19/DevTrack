import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/usersApi';
import { activityApi } from '../api/activityApi';
import { integrationsApi } from '../api/integrationsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import {
  Code2,
  ExternalLink,
  Edit2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  Award,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';

export const LeetCodePage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(user?.leetcodeStats || {});
  const [practiceLogs, setPracticeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedProfile, setDetectedProfile] = useState(null);

  // Edit Stats Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statsForm, setStatsForm] = useState({
    username: '',
    profileUrl: '',
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0,
    ranking: 0,
    avatar: '',
    isUserReported: true,
  });

  // Log Practice Problem Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    problemTitle: '',
    problemDifficulty: 'Medium',
    minutesSpent: 45,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user?.leetcodeStats) {
      setStats(user.leetcodeStats);
    }
  }, [user]);

  const fetchPracticeLogs = async () => {
    try {
      const res = await activityApi.getActivityLogs({ limit: 30 });
      if (res.success && res.data) {
        // Filter logs where type is LeetCode Practice or problemTitle exists
        const leetcodeLogs = res.data.filter(
          (l) => l.type === 'LeetCode Practice' || l.problemTitle
        );
        setPracticeLogs(leetcodeLogs);
      }
    } catch (err) {
      console.warn('Failed to fetch LeetCode practice logs:', err);
    }
  };

  useEffect(() => {
    fetchPracticeLogs();
  }, []);

  const handleOpenEdit = () => {
    setDetectedProfile(null);
    setStatsForm({
      username: stats.username || '',
      profileUrl: stats.profileUrl || '',
      easy: stats.easy || 0,
      medium: stats.medium || 0,
      hard: stats.hard || 0,
      total: stats.total || (stats.easy || 0) + (stats.medium || 0) + (stats.hard || 0),
      ranking: stats.ranking || 0,
      avatar: stats.avatar || '',
      isUserReported: stats.isUserReported !== undefined ? stats.isUserReported : true,
    });
    setIsEditModalOpen(true);
  };

  const handleAutoDetect = async () => {
    const rawUsername = statsForm.username.trim();
    if (!rawUsername) {
      addToast('Please enter your LeetCode username first', 'error');
      return;
    }

    try {
      setDetecting(true);
      const res = await integrationsApi.getLeetCodeData(rawUsername);
      if (res.success && res.data) {
        const d = res.data;
        setStatsForm({
          username: d.username,
          profileUrl: d.profileUrl,
          easy: d.easy,
          medium: d.medium,
          hard: d.hard,
          total: d.total,
          ranking: d.ranking,
          avatar: d.avatar,
          isUserReported: false,
        });
        setDetectedProfile(d);
        addToast(`Successfully detected ${d.total} solved problems for @${d.username}!`, 'success');
      }
    } catch (err) {
      addToast(err.message || `Could not find LeetCode profile for "${rawUsername}"`, 'error');
    } finally {
      setDetecting(false);
    }
  };

  const handleQuickSync = async () => {
    const targetUsername = stats.username?.trim();
    if (!targetUsername) {
      handleOpenEdit();
      return;
    }

    try {
      setSyncing(true);
      const res = await usersApi.syncLeetCodeStats(targetUsername);
      if (res.success) {
        setStats(res.data);
        updateUser({ leetcodeStats: res.data });
        addToast(`Synchronized ${res.data.total} problems directly from LeetCode!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to sync with LeetCode', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveStats = async (e) => {
    e.preventDefault();
    const easy = Number(statsForm.easy) || 0;
    const medium = Number(statsForm.medium) || 0;
    const hard = Number(statsForm.hard) || 0;
    const sum = easy + medium + hard;
    const total = Number(statsForm.total) || sum;

    if (total < sum) {
      addToast(`Total solved (${total}) cannot be less than sum of categories (${sum})`, 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        username: statsForm.username.trim(),
        profileUrl: statsForm.profileUrl.trim() || `https://leetcode.com/u/${statsForm.username.trim()}`,
        easy,
        medium,
        hard,
        total,
        ranking: statsForm.ranking || 0,
        avatar: statsForm.avatar || '',
        isUserReported: statsForm.isUserReported !== undefined ? statsForm.isUserReported : false,
      };

      const res = await usersApi.updateLeetCodeStats(payload);
      if (res.success) {
        setStats(res.data);
        updateUser({ leetcodeStats: res.data });
        addToast('LeetCode statistics updated successfully!', 'success');
        setIsEditModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update LeetCode statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogProblem = async (e) => {
    e.preventDefault();
    if (!logForm.problemTitle.trim()) {
      addToast('Please enter the problem title', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await activityApi.createActivityLog({
        date: logForm.date,
        minutesSpent: Number(logForm.minutesSpent) || 45,
        type: 'LeetCode Practice',
        problemTitle: logForm.problemTitle.trim(),
        problemDifficulty: logForm.problemDifficulty,
        description: logForm.description.trim() || `Solved ${logForm.problemDifficulty} problem`,
      });

      if (res.success) {
        addToast('Problem practice logged! Streak updated.', 'success');
        setIsLogModalOpen(false);
        setLogForm({
          problemTitle: '',
          problemDifficulty: 'Medium',
          minutesSpent: 45,
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
        fetchPracticeLogs();
      }
    } catch (err) {
      addToast(err.message || 'Failed to log problem practice', 'error');
    } finally {
      setLoading(false);
    }
  };

  const total = stats.total || (stats.easy || 0) + (stats.medium || 0) + (stats.hard || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#263524] flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#B65F3B]" /> LeetCode Progress & Practice Logs
          </h1>
          <p className="text-xs text-text-muted mt-0.5 font-mono">
            Track solved algorithmic challenges, problem difficulty breakdown, and practice sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stats.username && (
            <button
              onClick={handleQuickSync}
              disabled={syncing}
              className="devtrack-btn-secondary text-xs flex items-center gap-1.5"
              title="Sync latest solved challenges directly from LeetCode"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#B65F3B]' : 'text-[#B65F3B]'}`} />
              <span>{syncing ? 'Syncing...' : 'Sync LeetCode'}</span>
            </button>
          )}
          <button onClick={() => setIsLogModalOpen(true)} className="devtrack-btn-secondary text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-[#263524]" />
            <span>Log Practice Problem</span>
          </button>
          <button onClick={handleOpenEdit} className="devtrack-btn-primary text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{stats.username ? 'Edit / Auto-Detect' : 'Connect LeetCode'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {stats.username && stats.isUserReported === false ? (
        <div className="p-4 bg-[#EAF2E8]/60 border border-[#263524]/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#263524]/10 text-[#263524] shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed text-[#292C25]">
              <span className="font-semibold text-[#263524]">Live LeetCode Synchronization Active: </span>
              Problems solved, difficulty tiers, and global rank are automatically synchronized directly from <span className="font-mono text-[#263524] font-semibold">@{stats.username}</span>.
            </div>
          </div>
          <button
            onClick={handleQuickSync}
            disabled={syncing}
            className="devtrack-btn-secondary text-xs shrink-0 flex items-center gap-1.5 self-start sm:self-auto bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      ) : (
        <div className="p-4 bg-[#FAF6EE] border border-[#E3D5BD] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-[#B65F3B]/10 text-[#B65F3B] shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed text-text-secondary">
              <span className="font-semibold text-[#263524]">Connect LeetCode: </span>
              Enter your LeetCode username to automatically detect your solved questions, difficulty tiers, and global rank.
            </div>
          </div>
          <button
            onClick={handleOpenEdit}
            className="devtrack-btn-primary text-xs shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Connect</span>
          </button>
        </div>
      )}

      {/* Overview Card */}
      <div className="devtrack-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#E3D5BD]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF6EE] border border-[#E3D5BD] flex items-center justify-center text-[#B65F3B] shrink-0 shadow-xs">
              {stats.avatar ? (
                <img src={stats.avatar} alt="LeetCode Avatar" className="w-full h-full object-cover" />
              ) : (
                <Code2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-[#263524] tracking-tight">
                  {stats.username ? `@${stats.username}` : 'LeetCode Profile'}
                </h3>
                {stats.isUserReported === false ? (
                  <Badge variant="success" size="xs">
                    Live Synced
                  </Badge>
                ) : (
                  <Badge variant="warning" size="xs">
                    User-Reported
                  </Badge>
                )}
                {stats.ranking > 0 && (
                  <Badge variant="primary" size="xs">
                    Rank #{stats.ranking.toLocaleString()}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-muted font-mono mt-0.5">
                {stats.lastUpdated
                  ? `Last updated on ${new Date(stats.lastUpdated).toLocaleDateString()} at ${new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'No statistics recorded yet'}
              </p>
            </div>
          </div>

          {stats.profileUrl && (
            <a
              href={stats.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="devtrack-btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* 4 Difficulty Breakdown Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Solved */}
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E3D5BD]">
            <div className="flex items-center justify-between text-xs text-text-muted font-mono mb-1">
              <span>Total Solved</span>
              <Award className="w-4 h-4 text-[#B65F3B]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#263524]">{total}</div>
            <div className="text-[10px] text-text-muted font-mono mt-1">
              Aggregated across all levels
            </div>
          </div>

          {/* Easy */}
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#263524]/20">
            <div className="flex items-center justify-between text-xs text-[#263524] font-mono mb-1 font-semibold">
              <span>Easy</span>
              <span className="text-[11px] text-text-muted font-normal">
                {total > 0 ? Math.round(((stats.easy || 0) / total) * 100) : 0}%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#263524]">
              {stats.easy || 0}
            </div>
            <div className="w-full h-1 bg-[#EAE2D3] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#263524] rounded-full"
                style={{
                  width: `${total > 0 ? ((stats.easy || 0) / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Medium */}
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#B65F3B]/30">
            <div className="flex items-center justify-between text-xs text-[#B65F3B] font-mono mb-1 font-semibold">
              <span>Medium</span>
              <span className="text-[11px] text-text-muted font-normal">
                {total > 0 ? Math.round(((stats.medium || 0) / total) * 100) : 0}%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#B65F3B]">
              {stats.medium || 0}
            </div>
            <div className="w-full h-1 bg-[#EAE2D3] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#B65F3B] rounded-full"
                style={{
                  width: `${total > 0 ? ((stats.medium || 0) / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Hard */}
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#C24137]/30">
            <div className="flex items-center justify-between text-xs text-[#C24137] font-mono mb-1 font-semibold">
              <span>Hard</span>
              <span className="text-[11px] text-text-muted font-normal">
                {total > 0 ? Math.round(((stats.hard || 0) / total) * 100) : 0}%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#C24137]">
              {stats.hard || 0}
            </div>
            <div className="w-full h-1 bg-[#EAE2D3] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#C24137] rounded-full"
                style={{
                  width: `${total > 0 ? ((stats.hard || 0) / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Practice Logs Table */}
      <div className="devtrack-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#263524] tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#263524]" /> Personal Practice Sessions & Notes
            </h3>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              Specific algorithms and patterns you have solved
            </p>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="text-xs font-mono text-[#B65F3B] hover:text-[#9A4C2E] flex items-center gap-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Log Problem
          </button>
        </div>

        {practiceLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted font-mono">
            No practice logs recorded yet. Click "Log Practice Problem" to record problems solved!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3D5BD] text-text-muted font-mono">
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium">Problem Title</th>
                  <th className="pb-2.5 font-medium">Difficulty</th>
                  <th className="pb-2.5 font-medium">Time Taken</th>
                  <th className="pb-2.5 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D5BD]">
                {practiceLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FAF6EE] transition-colors">
                    <td className="py-2.5 font-mono text-text-muted">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 font-medium text-[#292C25]">
                      {log.problemTitle || 'LeetCode Practice'}
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={
                          log.problemDifficulty === 'Easy'
                            ? 'success'
                            : log.problemDifficulty === 'Hard'
                            ? 'danger'
                            : 'warning'
                        }
                        size="xs"
                      >
                        {log.problemDifficulty || 'Practice'}
                      </Badge>
                    </td>
                    <td className="py-2.5 font-mono text-text-secondary">
                      {log.minutesSpent} mins
                    </td>
                    <td className="py-2.5 text-text-muted max-w-sm truncate">
                      {log.description || 'Completed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connect / Edit Stats Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Connect LeetCode & Auto-Detect Stats"
      >
        <form onSubmit={handleSaveStats} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              LeetCode Username *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="devtrack-input w-full font-mono text-xs"
                placeholder="e.g. Ritikyadav19_"
                value={statsForm.username}
                onChange={(e) => setStatsForm({ ...statsForm, username: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAutoDetect();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={detecting || !statsForm.username.trim()}
                className="devtrack-btn-primary px-3 text-xs whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
                <span>{detecting ? 'Detecting...' : 'Auto-Detect'}</span>
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-1 font-mono">
              Click <strong>Auto-Detect</strong> to automatically fetch your solved questions, difficulty tiers, and ranking.
            </p>
          </div>

          {detectedProfile && (
            <div className="p-3 bg-[#EAF2E8]/70 border border-[#263524]/20 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                {detectedProfile.avatar ? (
                  <img src={detectedProfile.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-[#263524]/30 object-cover" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#263524]" />
                )}
                <div>
                  <div className="text-xs font-semibold text-[#263524] flex items-center gap-1.5">
                    <span>@{detectedProfile.username} detected</span>
                    {detectedProfile.ranking > 0 && (
                      <span className="text-[10px] font-mono text-text-muted font-normal">
                        (Rank #{detectedProfile.ranking.toLocaleString()})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-text-secondary font-mono mt-0.5">
                    Total: <strong className="text-[#263524]">{detectedProfile.total}</strong> • Easy: {detectedProfile.easy} • Med: {detectedProfile.medium} • Hard: {detectedProfile.hard}
                  </div>
                </div>
              </div>
              <Badge variant="success" size="xs">
                Live Verified
              </Badge>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Profile URL
            </label>
            <input
              type="url"
              className="devtrack-input w-full font-mono text-xs"
              placeholder="https://leetcode.com/u/..."
              value={statsForm.profileUrl}
              onChange={(e) => setStatsForm({ ...statsForm, profileUrl: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-[#263524] mb-1.5 font-semibold">
                Easy Solved
              </label>
              <input
                type="number"
                min="0"
                className="devtrack-input w-full font-mono"
                value={statsForm.easy}
                onChange={(e) => {
                  const easy = Number(e.target.value) || 0;
                  setStatsForm({
                    ...statsForm,
                    easy,
                    total: easy + Number(statsForm.medium) + Number(statsForm.hard),
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B65F3B] mb-1.5 font-semibold">
                Medium Solved
              </label>
              <input
                type="number"
                min="0"
                className="devtrack-input w-full font-mono"
                value={statsForm.medium}
                onChange={(e) => {
                  const medium = Number(e.target.value) || 0;
                  setStatsForm({
                    ...statsForm,
                    medium,
                    total: Number(statsForm.easy) + medium + Number(statsForm.hard),
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C24137] mb-1.5 font-semibold">
                Hard Solved
              </label>
              <input
                type="number"
                min="0"
                className="devtrack-input w-full font-mono"
                value={statsForm.hard}
                onChange={(e) => {
                  const hard = Number(e.target.value) || 0;
                  setStatsForm({
                    ...statsForm,
                    hard,
                    total: Number(statsForm.easy) + Number(statsForm.medium) + hard,
                  });
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Total Solved Count
              </label>
              <span className="text-xs font-mono text-[#263524] font-semibold">
                Sum: {Number(statsForm.easy) + Number(statsForm.medium) + Number(statsForm.hard)}
              </span>
            </div>
            <input
              type="number"
              min="0"
              className="devtrack-input w-full font-mono"
              value={statsForm.total}
              onChange={(e) => setStatsForm({ ...statsForm, total: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3D5BD]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="devtrack-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="devtrack-btn-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save & Sync Statistics'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Problem Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log LeetCode Practice Session"
      >
        <form onSubmit={handleLogProblem} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Problem Name *
            </label>
            <input
              type="text"
              className="devtrack-input w-full"
              placeholder="e.g. 15. 3Sum or Valid Anagram"
              value={logForm.problemTitle}
              onChange={(e) => setLogForm({ ...logForm, problemTitle: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Difficulty
              </label>
              <select
                className="devtrack-input w-full"
                value={logForm.problemDifficulty}
                onChange={(e) => setLogForm({ ...logForm, problemDifficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Time Taken (Mins)
              </label>
              <input
                type="number"
                min="1"
                max="600"
                className="devtrack-input w-full font-mono"
                value={logForm.minutesSpent}
                onChange={(e) => setLogForm({ ...logForm, minutesSpent: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Date Completed
            </label>
            <input
              type="date"
              className="devtrack-input w-full"
              value={logForm.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Notes / Approach / Time & Space Complexity
            </label>
            <textarea
              rows="3"
              className="devtrack-input w-full resize-none text-xs"
              placeholder="Used Two-pointer technique after sorting. O(n^2) time complexity..."
              value={logForm.description}
              onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3D5BD]">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="devtrack-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="devtrack-btn-primary">
              {loading ? 'Logging...' : 'Save Problem Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
