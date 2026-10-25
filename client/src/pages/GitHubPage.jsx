import React, { useState, useEffect, useCallback } from 'react';
import { integrationsApi } from '../api/integrationsApi';
import { usersApi } from '../api/usersApi';
import { projectsApi } from '../api/projectsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { Badge } from '../components/common/Badge';
import {
  Star,
  GitFork,
  BookOpen,
  Users,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  AlertCircle,
  Check,
  Building,
  MapPin,
  Link as LinkIcon,
  Plus,
} from 'lucide-react';
import { Github } from '../components/common/Icons';

export const GitHubPage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [usernameInput, setUsernameInput] = useState(user?.githubUsername || '');
  const [gitData, setGitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const [savingDefault, setSavingDefault] = useState(false);
  const [trackedUrls, setTrackedUrls] = useState(new Set());
  const [importingRepoId, setImportingRepoId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchTrackedProjects = useCallback(async () => {
    try {
      const res = await projectsApi.getProjects();
      if (res.success && Array.isArray(res.data)) {
        const urls = new Set(
          res.data
            .map((p) => p.githubUrl && p.githubUrl.toLowerCase())
            .filter(Boolean)
        );
        setTrackedUrls(urls);
      }
    } catch (err) {
      console.warn('Could not load tracked projects:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrackedProjects();
  }, [fetchTrackedProjects]);

  const handleTrackRepo = async (repo) => {
    try {
      setImportingRepoId(repo.id);
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
        setTrackedUrls((prev) => new Set([...prev, repo.htmlUrl.toLowerCase()]));
        addToast(`Tracked "${repo.name}" in DevTrack Projects!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to track project', 'error');
    } finally {
      setImportingRepoId(null);
    }
  };

  const fetchGitHub = useCallback(
    async (targetUsername) => {
      if (!targetUsername || !targetUsername.trim()) return;

      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await integrationsApi.getGitHubData(targetUsername.trim());
        if (res.success) {
          setGitData(res.data);
          addToast(`Loaded live GitHub data for @${res.data.profile.username}`, 'success');
        }
      } catch (err) {
        setGitData(null);
        const msg = err.message || 'Failed to fetch GitHub data';
        setErrorMessage(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    if (user?.githubUsername) {
      setUsernameInput(user.githubUsername);
      fetchGitHub(user.githubUsername);
    }
  }, [user?.githubUsername, fetchGitHub]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      fetchGitHub(usernameInput.trim());
    }
  };

  const handleSaveAsDefault = async () => {
    if (!gitData?.profile?.username) return;
    try {
      setSavingDefault(true);
      const res = await usersApi.updateProfile({
        githubUsername: gitData.profile.username,
      });
      if (res.success) {
        updateUser({ githubUsername: gitData.profile.username });
        addToast('Saved as your default GitHub account!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to save default username', 'error');
    } finally {
      setSavingDefault(false);
    }
  };

  const filteredRepos = gitData?.repositories?.filter((repo) => {
    if (!repoSearch.trim()) return true;
    const q = repoSearch.toLowerCase();
    return (
      repo.name.toLowerCase().includes(q) ||
      (repo.description && repo.description.toLowerCase().includes(q)) ||
      (repo.language && repo.language.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#263524] flex items-center gap-2">
            <Github className="w-5 h-5 text-[#263524]" /> GitHub Activity & Repositories
          </h1>
          <p className="text-xs text-[#6E7167] mt-0.5 font-mono">
            Direct integration with the official GitHub REST API (No frontend access tokens exposed)
          </p>
        </div>

        {gitData && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <Badge variant="success" size="xs" className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#263524] animate-pulse" /> Live API
            </Badge>
            {gitData.rateLimit?.remaining !== null && (
              <span className="text-[11px] text-[#6E7167] bg-[#EAE2D3] px-2 py-0.5 rounded border border-[#E3D5BD]">
                Rate Limit: {gitData.rateLimit.remaining}/{gitData.rateLimit.limit}
              </span>
            )}
          </div>
        )}
      </div>

      {/* GitHub Username Search Card */}
      <div className="devtrack-card p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <input
              type="text"
              className="devtrack-input devtrack-input-with-icon w-full pl-10 font-mono text-xs"
              placeholder="Enter public GitHub username (e.g. DevRitik19, torvalds, octocat)..."
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
            <Github className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading || !usernameInput.trim()}
              className="devtrack-btn-primary text-xs py-2 px-4 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" /> Fetch Live Data
                </>
              )}
            </button>

            {gitData?.profile && user?.githubUsername !== gitData.profile.username && (
              <button
                type="button"
                onClick={handleSaveAsDefault}
                disabled={savingDefault}
                className="devtrack-btn-secondary text-xs py-2 px-3 whitespace-nowrap text-[#263524]"
                title="Save this GitHub username to your DevTrack profile"
              >
                {savingDefault ? 'Saving...' : 'Set as My Account'}
              </button>
            )}
          </div>
        </form>

        {gitData?.lastRefreshed && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#6E7167] mt-2 font-mono">
            <Clock className="w-3 h-3" /> Last refreshed:{' '}
            {new Date(gitData.lastRefreshed).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FDF2F0] border border-[#C24137]/30 text-xs text-[#C24137] flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-mono">{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="devtrack-card p-6 h-40 animate-pulse bg-[#EAE2D3]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      )}

      {/* Profile Details & Repository List */}
      {!loading && gitData?.profile && (
        <>
          {/* User Profile Card */}
          <div className="devtrack-card p-6">
            {/* Connected Account & Demo Context Header */}
            <div className="mb-5 pb-4 border-b border-[#E3D5BD] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#263524]">
                <Github className="w-4 h-4 shrink-0 text-[#263524]" />
                <span className="font-mono">
                  Connected Account: <strong className="font-semibold text-[#263524]">@{gitData.profile.username}</strong>
                </span>
                {user?.githubUsername === gitData.profile.username ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#263524]/10 text-[#263524] border border-[#263524]/20 font-medium">
                    Profile Linked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF6EE] text-[#6E7167] border border-[#E3D5BD]">
                    Public Search Preview
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#6E7167] font-mono">
                Live GitHub REST API Response
              </span>
            </div>

            {/* Transparent Demo Context Note */}
            {user?.email === 'demo@devtrack.io' && gitData.profile.username === 'DevRitik19' && (
              <div className="mb-5 p-3 rounded-lg bg-[#EAF2E8]/60 border border-[#263524]/20 text-[11px] text-[#263524] leading-relaxed">
                <strong>Demonstration Context:</strong> This demo environment connects to project author <strong className="font-mono">@DevRitik19</strong> to showcase authentic live GitHub repositories, primary languages, and stargazers. You can type any public GitHub username above to inspect other developers or set your own default.
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={gitData.profile.avatarUrl}
                  alt={gitData.profile.username}
                  className="w-16 h-16 rounded-xl border border-[#E3D5BD] object-cover shrink-0 shadow-sm"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-[#263524] tracking-tight">
                      {gitData.profile.name}
                    </h2>
                    <span className="text-xs font-mono text-[#6E7167]">
                      @{gitData.profile.username}
                    </span>
                  </div>

                  {gitData.profile.bio && (
                    <p className="text-xs text-[#6E7167] mt-1 max-w-xl leading-relaxed">
                      {gitData.profile.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6E7167] mt-2 font-mono">
                    {gitData.profile.company && (
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" /> {gitData.profile.company}
                      </span>
                    )}
                    {gitData.profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {gitData.profile.location}
                      </span>
                    )}
                    {gitData.profile.blog && (
                      <a
                        href={gitData.profile.blog.startsWith('http') ? gitData.profile.blog : `https://${gitData.profile.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#263524] transition-colors"
                      >
                        <LinkIcon className="w-3.5 h-3.5" /> {gitData.profile.blog}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Profile Link */}
              <a
                href={gitData.profile.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="devtrack-btn-secondary text-xs self-start md:self-center"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* GitHub Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E3D5BD]">
              <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E3D5BD]">
                <div className="text-[11px] text-[#6E7167] font-mono">Public Repositories</div>
                <div className="text-lg font-bold font-mono text-[#263524] mt-0.5">
                  {gitData.profile.publicRepos}
                </div>
              </div>
              <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E3D5BD]">
                <div className="text-[11px] text-[#6E7167] font-mono">Followers</div>
                <div className="text-lg font-bold font-mono text-[#263524] mt-0.5">
                  {gitData.profile.followers}
                </div>
              </div>
              <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E3D5BD]">
                <div className="text-[11px] text-[#6E7167] font-mono">Total Stars Earned</div>
                <div className="text-lg font-bold font-mono text-[#B65F3B] mt-0.5">
                  {gitData.stats.totalStars}
                </div>
              </div>
              <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E3D5BD]">
                <div className="text-[11px] text-[#6E7167] font-mono">Total Forks</div>
                <div className="text-lg font-bold font-mono text-[#2C5267] mt-0.5">
                  {gitData.stats.totalForks}
                </div>
              </div>
            </div>

            {/* Top Languages Breakdown */}
            {gitData.stats.topLanguages && gitData.stats.topLanguages.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#E3D5BD]">
                <span className="text-xs font-semibold text-[#263524] block mb-2 font-mono">
                  Primary Programming Languages
                </span>
                <div className="flex flex-wrap gap-2">
                  {gitData.stats.topLanguages.map((lang) => (
                    <span
                      key={lang.name}
                      className="text-xs font-mono px-2.5 py-1 rounded bg-[#EAE2D3] text-[#292C25] border border-[#E3D5BD] flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#263524]" />
                      {lang.name} <span className="text-[#6E7167]">({lang.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Repositories List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[#263524] tracking-tight flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#263524]" /> Public Repositories ({filteredRepos.length})
                </h3>
                <p className="text-xs text-[#6E7167] font-mono">
                  Sorted by recent commits & updates
                </p>
              </div>

              {/* Filter input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
                  placeholder="Filter repositories..."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                />
                <Search className="w-3.5 h-3.5 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {filteredRepos.length === 0 ? (
              <div className="devtrack-card p-8 text-center text-xs text-[#6E7167] font-mono">
                No repositories matched your search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="devtrack-card p-5 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-[#263524] hover:text-[#B65F3B] transition-colors flex items-center gap-1.5 truncate group-hover:underline"
                        >
                          {repo.name}
                          <ExternalLink className="w-3 h-3 text-[#6E7167] shrink-0" />
                        </a>
                        {repo.isFork && (
                          <Badge variant="neutral" size="xs">
                            Fork
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-[#6E7167] line-clamp-2 mb-3 min-h-[2.5rem] leading-relaxed">
                        {repo.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E3D5BD] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <span className="flex items-center gap-1 text-[#292C25]">
                            <span className="w-2 h-2 rounded-full bg-[#263524]" />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[#B65F3B]">
                          <Star className="w-3 h-3 fill-[#B65F3B]/20" /> {repo.stars}
                        </span>
                        <span className="flex items-center gap-1 text-[#6E7167]">
                          <GitFork className="w-3 h-3" /> {repo.forks}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {trackedUrls.has(repo.htmlUrl.toLowerCase()) ? (
                          <span className="text-[11px] font-mono text-[#263524] flex items-center gap-1 font-medium">
                            <Check className="w-3 h-3" /> Tracked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTrackRepo(repo)}
                            disabled={importingRepoId === repo.id}
                            className="devtrack-btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1 text-[#263524] hover:bg-white"
                            title="Add to My Projects"
                          >
                            {importingRepoId === repo.id ? (
                              'Tracking...'
                            ) : (
                              <>
                                <Plus className="w-3 h-3" /> Track as Project
                              </>
                            )}
                          </button>
                        )}
                        <span className="text-[10px] text-[#6E7167] hidden sm:inline">
                          {new Date(repo.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State before any search */}
      {!loading && !gitData && (
        <div className="devtrack-card p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#EAE2D3] border border-[#E3D5BD] flex items-center justify-center text-[#6E7167]">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#263524]">No GitHub data loaded</h3>
            <p className="text-xs text-[#6E7167] mt-1 max-w-sm">
              Enter any valid public GitHub username above to instantly inspect repositories, stars, and language distribution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
