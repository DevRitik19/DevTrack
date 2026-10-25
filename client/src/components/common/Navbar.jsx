import React from 'react';
import { Menu, Plus, LogOut, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const Navbar = ({ onOpenMobileMenu, onOpenLogModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#F4F0E6]/90 backdrop-blur-md border-b border-[#E3D5BD]">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[#EAE2D3] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted hidden sm:inline">workspace /</span>
          <span className="text-sm font-semibold text-[#263524] tracking-tight">
            {user?.name || user?.username || 'Developer Hub'}
          </span>
          {user?.email === 'demo@devtrack.io' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#B65F3B]/10 text-[#B65F3B] border border-[#B65F3B]/30">
              Demo Account
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Log Session Button (Primary Terracotta Action) */}
        <button
          onClick={onOpenLogModal}
          className="devtrack-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
          title="Record daily coding session"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Log Activity</span>
        </button>

        {/* View Public Profile */}
        {user?.username && (
          <Link
            to={`/u/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="devtrack-btn-secondary text-xs py-1.5 px-2.5 hidden md:flex items-center gap-1.5 text-text-secondary hover:text-text-primary"
            title="Open your public developer profile in new tab"
          >
            <Globe className="w-3.5 h-3.5 text-[#263524]" />
            <span>Public Profile</span>
            <ExternalLink className="w-3 h-3 text-text-muted" />
          </Link>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg text-text-secondary hover:text-[#C24137] hover:bg-[#FDF2F0] border border-transparent hover:border-[#F3CECB] transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
