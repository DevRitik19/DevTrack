import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Target,
  Code2,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { Github } from './Icons';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    { name: 'My Projects', to: '/projects', icon: FolderGit2 },
    { name: 'Goals & Habits', to: '/goals', icon: Target },
    { name: 'GitHub Activity', to: '/github', icon: Github },
    { name: 'LeetCode Progress', to: '/leetcode', icon: Code2 },
    { name: 'Public Profile', to: user ? `/u/${user.username}` : '/profile', icon: User, externalIcon: true },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#263524]/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#263524] border-r border-[#344632] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#344632]">
          <NavLink
            to="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 overflow-hidden text-text-primary hover:opacity-95 transition-opacity"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1E2B1D] border border-[#3A4E38] flex items-center justify-center shrink-0 text-[#B65F3B] shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  DevTrack
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#B65F3B]/20 text-[#EAC9BD] border border-[#B65F3B]/30 rounded font-mono">
                    MVP
                  </span>
                </span>
                <span className="text-[11px] text-[#A2B39E] font-mono">Progress Hub</span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#A2B39E] hover:text-white hover:bg-[#1E2B1D] border border-transparent hover:border-[#3A4E38] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={handleLinkClick}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1E2B1D] text-white border-l-2 border-[#B65F3B] shadow-sm font-semibold'
                      : 'text-[#BAC7B7] hover:text-white hover:bg-[#2F402D]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isCollapsed ? 'w-5 h-5' : ''}`} />
                {!isCollapsed && (
                  <span className="flex-1 truncate flex items-center justify-between">
                    {item.name}
                    {item.externalIcon && (
                      <ExternalLink className="w-3 h-3 text-[#A2B39E] ml-1 opacity-75" />
                    )}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        {user && (
          <div className="p-3 border-t border-[#344632]">
            <NavLink
              to="/settings"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E2B1D] border border-transparent hover:border-[#3A4E38] transition-all ${
                isCollapsed ? 'justify-center p-1' : ''
              }`}
              title={isCollapsed ? user.name || user.username : undefined}
            >
              <div className="w-8 h-8 rounded-full bg-[#1E2B1D] border border-[#3A4E38] flex items-center justify-center font-mono text-xs text-[#EAE2D3] uppercase shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (user.name || user.username).substring(0, 2)
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {user.name || user.username}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] text-[#A2B39E] truncate font-mono">
                      @{user.username}
                    </p>
                    {user?.email === 'demo@devtrack.io' && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#B65F3B]/30 text-[#E8A588] border border-[#B65F3B]/50 leading-tight">
                        DEMO
                      </span>
                    )}
                  </div>
                </div>
              )}
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
};
