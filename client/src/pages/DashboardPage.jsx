import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { integrationsApi } from '../api/integrationsApi';
import { projectsApi } from '../api/projectsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heatmap } from '../components/common/Heatmap';
import { StatCardSkeleton, CardSkeleton } from '../components/common/SkeletonLoader';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  CheckCircle2,
  Code2,
  Target,
  Flame,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Star,
  GitFork,
  ExternalLink,
  Plus,
  Check,
} from 'lucide-react';
import { Github } from '../components/common/Icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [gitData, setGitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importingRepoName, setImportingRepoName] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getMetrics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGitHub = useCallback(async (username) => {
    if (!username) return;
    try {
      const res = await integrationsApi.getGitHubData(username);
      if (res.success) {
        setGitData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load live GitHub metrics for dashboard:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const handleActivityLogged = () => {
      fetchDashboard();
    };
    window.addEventListener('devtrack:activity_logged', handleActivityLogged);
    return () => {
      window.removeEventListener('devtrack:activity_logged', handleActivityLogged);
    };
  }, [fetchDashboard]);

  useEffect(() => {
    if (user?.githubUsername) {
      fetchGitHub(user.githubUsername);
    } else {
      setGitData(null);
    }
  }, [user?.githubUsername, fetchGitHub]);

  const handleTrackRepoAsProject = async (repo) => {
    try {
      setImportingRepoName(repo.name);
      const payload = {
        title: repo.name,
        description: repo.description || 'Imported from GitHub repository',
        status: 'In Progress',
        completionPercentage: 50,
        githubUrl: repo.htmlUrl,
        technologies: repo.language ? [repo.language] : ['GitHub'],
        isPublic: true,
      };

      const res = await projectsApi.createProject(payload);
      if (res.success) {
        addToast(`Tracked "${repo.name}" as an active DevTrack project!`, 'success');
        fetchDashboard();
      }
    } catch (err) {
      addToast(err.message || 'Failed to track project', 'error');
    } finally {
      setImportingRepoName(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 devtrack-card p-6 h-64 animate-pulse bg-[#151517]" />
          <div className="devtrack-card p-6 h-64 animate-pulse bg-[#151517]" />
        </div>
      </div>
    );
  }

  const { stats, weeklyChart, heatmap, recentProjects, recentGoals } = data;

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.projects.total,
      sub: gitData ? `${stats.projects.completed} done • ${gitData.profile?.publicRepos || 0} on GitHub` : `${stats.projects.completed} completed`,
      icon: FolderGit2,
      color: 'text-[#263524]',
      to: '/projects',
    },
    {
      title: 'GitHub Repos',
      value: gitData ? gitData.profile?.publicRepos : (user?.githubUsername ? '...' : 0),
      sub: gitData
        ? `${gitData.stats?.totalStars || 0} stars • ${gitData.profile?.followers || 0} followers`
        : (user?.githubUsername ? 'Fetching live repos...' : 'Not connected'),
      icon: Github,
      color: 'text-[#263524]',
      to: '/github',
      badge: user?.githubUsername ? 'Live' : null,
    },
    {
      title: 'Completed',
      value: stats.projects.completed,
      sub: `${stats.projects.completionRate}% completion rate`,
      icon: CheckCircle2,
      color: 'text-[#263524]',
      to: '/projects?status=Completed',
    },
    {
      title: 'Current Streak',
      value: `${stats.activity.currentStreak} d`,
      sub: `Best: ${stats.activity.longestStreak} days active`,
      icon: Flame,
      color: 'text-[#B65F3B]',
      to: '/goals',
    },
    {
      title: 'Weekly Focus',
      value: `${stats.activity.weeklyHours} h`,
      sub: `${stats.activity.totalDaysActive} total days recorded`,
      icon: Clock,
      color: 'text-[#2C5267]',
      to: '/goals',
    },
    {
      title: 'LeetCode Solved',
      value: stats.leetcode.totalSolved,
      sub: stats.leetcode.ranking
        ? `Rank #${stats.leetcode.ranking.toLocaleString()}`
        : stats.leetcode.isUserReported === false
        ? 'Live synchronized'
        : 'User-reported metrics',
      icon: Code2,
      color: 'text-[#6E4E37]',
      to: '/leetcode',
      badge: stats.leetcode.isUserReported === false ? 'Live' : (stats.leetcode.totalSolved ? 'Reported' : null),
    },
    {
      title: 'Active Goals',
      value: stats.goals.active,
      sub: `${stats.goals.completed} milestones met`,
      icon: Target,
      color: 'text-[#B65F3B]',
      to: '/goals',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#263524] flex items-center gap-2">
            Welcome back, {user?.name || user?.username}
            <Sparkles className="w-4 h-4 text-[#B65F3B]" />
          </h1>
          <p className="text-xs text-[#6E7167] mt-0.5 font-mono">
            Here is your real-time developer momentum and milestones overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stats.github.connected ? (
            <Link
              to="/github"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAE2D3] border border-[#E3D5BD] text-xs font-mono text-[#292C25] hover:border-[#D4C4A8] transition-colors"
            >
              <Github className="w-3.5 h-3.5 text-[#263524]" />
              <span>@{stats.github.username}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#263524]" />
            </Link>
          ) : (
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAE2D3] border border-[#E3D5BD] text-xs text-[#6E7167] hover:text-[#263524] transition-colors"
            >
              <Github className="w-3.5 h-3.5 text-[#6E7167]" />
              <span>Connect GitHub</span>
            </Link>
          )}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={i}
              to={c.to}
              className="devtrack-card p-4 flex flex-col justify-between group hover:border-[#D4C4A8]"
            >
              <div className="flex items-center justify-between text-[#6E7167] mb-2">
                <span className="text-[11px] font-medium tracking-tight text-[#6E7167]">
                  {c.title}
                </span>
                <Icon className={`w-4 h-4 ${c.color} opacity-85 group-hover:opacity-100`} />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-[#263524] tracking-tight">
                  {c.value}
                </div>
                <div className="text-[10px] text-[#6E7167] font-mono mt-0.5 truncate">
                  {c.sub}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Weekly Activity Chart & Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 devtrack-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#B65F3B]" /> Weekly Activity Overview
              </h2>
              <p className="text-xs text-[#6E7167] mt-0.5">
                Hours logged across the past 7 days based on saved activity logs
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-[#6E7167]">7-Day Total</span>
              <p className="text-sm font-bold font-mono text-[#263524]">
                {stats.activity.weeklyHours} hours
              </p>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  stroke="#6E7167"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E3D5BD' }}
                />
                <YAxis
                  stroke="#6E7167"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E3D5BD' }}
                  tickFormatter={(val) => `${val}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E3D5BD',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#292C25',
                    boxShadow: '0 4px 12px rgba(38, 53, 36, 0.08)',
                  }}
                  cursor={{ fill: 'rgba(182, 95, 59, 0.06)' }}
                  formatter={(value) => [`${value} hours`, 'Time Logged']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar
                  dataKey="hours"
                  fill="#B65F3B"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Pipeline Summary */}
        <div className="devtrack-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#263524]" /> Project Pipeline
              </h2>
              <Link
                to="/projects"
                className="text-xs font-mono text-[#6E7167] hover:text-[#263524] flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4 pt-1">
              {/* In Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-[#6E7167]">In Progress</span>
                  <span className="text-[#B65F3B] font-semibold">{stats.projects.inProgress}</span>
                </div>
                <div className="w-full h-1.5 bg-[#EAE2D3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B65F3B] rounded-full"
                    style={{
                      width: `${
                        stats.projects.total > 0
                          ? (stats.projects.inProgress / stats.projects.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Completed */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-[#6E7167]">Completed</span>
                  <span className="text-[#263524] font-semibold">{stats.projects.completed}</span>
                </div>
                <div className="w-full h-1.5 bg-[#EAE2D3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#263524] rounded-full"
                    style={{
                      width: `${
                        stats.projects.total > 0
                          ? (stats.projects.completed / stats.projects.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Planned */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-[#6E7167]">Planned</span>
                  <span className="text-[#8A8D83] font-semibold">{stats.projects.planned}</span>
                </div>
                <div className="w-full h-1.5 bg-[#EAE2D3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8A8D83] rounded-full"
                    style={{
                      width: `${
                        stats.projects.total > 0
                          ? (stats.projects.planned / stats.projects.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E3D5BD] mt-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#6E7167]">Overall Completion Rate</span>
              <span className="text-[#263524] font-bold">{stats.projects.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-style Contribution Heatmap */}
      <div className="devtrack-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#B65F3B]" /> Contribution Activity Heatmap
            </h2>
            <p className="text-xs text-[#6E7167] mt-0.5">
              Daily recorded sessions & practice streaks across the past 24 weeks
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[#6E7167]">
            <span>
              Active Days: <strong className="text-[#292C25]">{stats.activity.totalDaysActive}</strong>
            </span>
            <span>•</span>
            <span>
              Streak: <strong className="text-[#B65F3B]">{stats.activity.currentStreak} days</strong>
            </span>
          </div>
        </div>

        <Heatmap activityData={heatmap} weeksCount={24} />
      </div>

      {/* Connected GitHub Repositories Showcase (if GitHub connected) */}
      {gitData && gitData.repositories?.length > 0 && (
        <div className="devtrack-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2">
                <Github className="w-4 h-4 text-[#263524]" />
                <span>Connected GitHub Repositories (@{gitData.profile?.username})</span>
                <Badge variant="success" size="xs">Live</Badge>
              </h2>
              <p className="text-xs text-[#6E7167] mt-0.5 font-mono">
                Showing top public repositories. Click "Track in DevTrack" to track any repo in your active project pipeline.
              </p>
            </div>
            <Link
              to="/github"
              className="text-xs font-mono text-[#B65F3B] hover:text-[#A3502E] flex items-center gap-1 shrink-0 font-medium"
            >
              View all {gitData.profile?.publicRepos} repos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {gitData.repositories.slice(0, 4).map((repo) => {
              const isAlreadyTracked = recentProjects.some(
                (p) => p.githubUrl && p.githubUrl.toLowerCase() === repo.htmlUrl.toLowerCase()
              );

              return (
                <div
                  key={repo.id}
                  className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E3D5BD] hover:border-[#D4C4A8] flex flex-col justify-between transition-colors group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#263524] hover:text-[#B65F3B] truncate flex items-center gap-1 group-hover:underline"
                        title={repo.name}
                      >
                        {repo.name}
                        <ExternalLink className="w-2.5 h-2.5 text-[#6E7167] shrink-0" />
                      </a>
                      {repo.isFork && (
                        <span className="text-[9px] font-mono px-1 rounded bg-[#EAE2D3] text-[#6E7167]">
                          Fork
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E7167] line-clamp-2 min-h-[2rem] leading-relaxed mb-3">
                      {repo.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E3D5BD] flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-2 text-[#6E7167]">
                      {repo.language && (
                        <span className="flex items-center gap-1 text-[#292C25]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#263524]" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-[#B65F3B]">
                        <Star className="w-3 h-3 fill-[#B65F3B]/20" /> {repo.stars}
                      </span>
                    </div>

                    {isAlreadyTracked ? (
                      <span className="text-[10px] text-[#263524] flex items-center gap-0.5 font-medium">
                        <Check className="w-3 h-3" /> Tracked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTrackRepoAsProject(repo)}
                        disabled={importingRepoName === repo.name}
                        className="devtrack-btn-secondary text-[10px] py-0.5 px-2 flex items-center gap-1 text-[#263524] hover:bg-white"
                        title="Track as DevTrack project"
                      >
                        {importingRepoName === repo.name ? (
                          'Tracking...'
                        ) : (
                          <>
                            <Plus className="w-2.5 h-2.5" /> Track
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Section: Recent Projects & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="devtrack-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#263524]" /> Recent Projects
              </h2>
              <Link
                to="/projects"
                className="text-xs font-mono text-[#6E7167] hover:text-[#263524] flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6E7167] font-mono">
                No projects created yet.{' '}
                <Link to="/projects" className="text-[#B65F3B] hover:underline">
                  Create your first project
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E3D5BD]">
                {recentProjects.map((p) => (
                  <div key={p._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#292C25] truncate">
                          {p.title}
                        </span>
                        <Badge
                          variant={
                            p.status === 'Completed'
                              ? 'success'
                              : p.status === 'In Progress'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="xs"
                        >
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[#6E7167]">
                          {p.completionPercentage}% complete
                        </span>
                        {p.technologies && p.technologies.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#EAE2D3] text-[#292C25] border border-[#E3D5BD]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#6E7167] shrink-0">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Learning Goals */}
        <div className="devtrack-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#B65F3B]" /> Active Goals & Milestones
              </h2>
              <Link
                to="/goals"
                className="text-xs font-mono text-[#6E7167] hover:text-[#263524] flex items-center gap-1"
              >
                Manage goals <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {recentGoals.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6E7167] font-mono">
                No active learning goals right now.{' '}
                <Link to="/goals" className="text-[#B65F3B] hover:underline">
                  Set a goal
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E3D5BD]">
                {recentGoals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentValue / (g.targetValue || 1)) * 100));
                  return (
                    <div key={g._id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[#292C25] truncate">
                          {g.title}
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#B65F3B] shrink-0">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EAE2D3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B65F3B] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#6E7167]">
                        <span>
                          {g.currentValue} / {g.targetValue} {g.unit}
                        </span>
                        <span>{g.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
