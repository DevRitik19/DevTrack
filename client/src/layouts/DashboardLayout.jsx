import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { ActivityLogModal } from '../components/goals/ActivityLogModal';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F0E6] flex text-text-primary">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Quick Activity Logger Modal */}
      <ActivityLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onLogged={() => {
          // Trigger any refresh if needed or dispatch event
          window.dispatchEvent(new CustomEvent('devtrack:activity_logged'));
        }}
      />
    </div>
  );
};
