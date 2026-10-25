import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import { Badge } from '../components/common/Badge';
import {
  Terminal,
  Code2,
  ExternalLink,
  Globe,
  FolderGit2,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Github } from '../components/common/Icons';

export const PublicProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await usersApi.getPublicProfile(username);
        if (res.success) {
          setProfile(res.data);
        }
      } catch (err) {
        setError(err.message || 'Developer profile not found');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F0E6] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E3D5BD] flex items-center justify-center text-[#B65F3B] animate-pulse shadow-xs">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-text-muted">Loading developer portfolio...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F4F0E6] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#E3D5BD] flex items-center justify-center text-text-muted mb-4 shadow-xs">
          <Lock className="w-8 h-8 text-[#B65F3B]" />
        </div>
        <h1 className="text-xl font-bold text-[#263524] tracking-tight">Profile Unavailable</h1>
        <p className="text-xs text-text-muted mt-2 max-w-sm font-mono leading-relaxed">
          {error || 'This developer profile is either private or does not exist.'}
        </p>
        <Link to="/" className="devtrack-btn-secondary text-xs mt-6 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to DevTrack
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0E6] text-text-primary py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Navigation Bar / Branding */}
        <div className="flex items-center justify-between border-b border-[#E3D5BD] pb-4">
          <Link to="/" className="flex items-center gap-2 text-[#6E7167] hover:text-[#263524] transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#263524] flex items-center justify-center text-[#F4F0E6]">
              <Terminal className="w-4 h-4 text-[#B65F3B]" />
            </div>
            <span className="text-xs font-bold tracking-tight text-[#263524] font-mono">DevTrack</span>
          </Link>

          <span className="text-[11px] font-mono text-text-muted flex items-center gap-1 bg-[#FAF6EE] px-2.5 py-1 rounded-full border border-[#E3D5BD]">
            <Globe className="w-3 h-3 text-[#263524]" /> Public Profile
          </span>
        </div>

        {/* Profile Header Card */}
        <div className="devtrack-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[#263524] border border-[#344632] flex items-center justify-center font-mono text-xl font-bold text-[#F4F0E6] uppercase shrink-0 shadow-md overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.name.substring(0, 2)
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-[#263524]">
                    {profile.name}
                  </h1>
                  <Badge variant="success" size="xs" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Verified Developer
                  </Badge>
                </div>
                <p className="text-xs font-mono text-text-muted mt-0.5">@{profile.username}</p>

                {profile.bio && (
                  <p className="text-xs text-text-secondary mt-2.5 max-w-lg leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Action Links (GitHub, LeetCode) */}
            <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
              {profile.github && (
                <a
                  href={profile.github.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="devtrack-btn-secondary text-xs w-full justify-center"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </a>
              )}
              {profile.leetcode && (
                <a
                  href={profile.leetcode.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="devtrack-btn-secondary text-xs w-full justify-center border-[#B65F3B]/30 text-[#B65F3B] hover:bg-[#B65F3B]/10"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>LeetCode Profile</span>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </a>
              )}
            </div>
          </div>

          {/* Technical Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[#E3D5BD]">
              <span className="text-xs font-mono text-text-muted block mb-2.5">
                Technical Stack & Core Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-mono px-3 py-1 rounded-lg bg-[#EAE2D3] text-[#292C25] border border-[#E3D5BD]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E3D5BD]">
            <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E3D5BD]">
              <div className="text-[10px] text-text-muted font-mono">Public Projects</div>
              <div className="text-lg font-bold font-mono text-[#263524] mt-0.5">
                {profile.stats.totalPublicProjects}
              </div>
            </div>
            <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E3D5BD]">
              <div className="text-[10px] text-text-muted font-mono">Completed Projects</div>
              <div className="text-lg font-bold font-mono text-[#263524] mt-0.5">
                {profile.stats.completedProjects}
              </div>
            </div>
            <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E3D5BD]">
              <div className="text-[10px] text-text-muted font-mono">LeetCode Solved</div>
              <div className="text-lg font-bold font-mono text-[#B65F3B] mt-0.5">
                {profile.leetcode ? ((profile.leetcode.easy || 0) + (profile.leetcode.medium || 0) + (profile.leetcode.hard || 0) || profile.leetcode.total) : 0}
              </div>
            </div>
            <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E3D5BD]">
              <div className="text-[10px] text-text-muted font-mono">Joined Community</div>
              <div className="text-xs font-bold font-mono text-text-secondary mt-1">
                {new Date(profile.joinedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Public Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#263524] tracking-tight flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-[#263524]" /> Featured & Public Projects ({profile.projects.length})
            </h2>
          </div>

          {profile.projects.length === 0 ? (
            <div className="devtrack-card p-10 text-center text-xs text-text-muted font-mono">
              No public projects displayed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects.map((proj) => (
                <div
                  key={proj._id}
                  className="devtrack-card p-5 flex flex-col justify-between hover:border-[#B65F3B]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold text-[#263524] tracking-tight">
                        {proj.title}
                      </h3>
                      <Badge
                        variant={
                          proj.status === 'Completed'
                            ? 'success'
                            : proj.status === 'In Progress'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="xs"
                      >
                        {proj.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EAE2D3] text-[#292C25] border border-[#E3D5BD]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E3D5BD] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[#6E7167] hover:text-[#263524] transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {proj.liveDemoUrl && (
                        <a
                          href={proj.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[#B65F3B] hover:text-[#9A4C2E] transition-colors font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted">
                      {proj.completionPercentage}% complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-[#E3D5BD] text-xs text-text-muted font-mono">
          Powered by <Link to="/" className="text-[#263524] font-semibold hover:underline">DevTrack Progress Hub</Link>
        </div>
      </div>
    </div>
  );
};
