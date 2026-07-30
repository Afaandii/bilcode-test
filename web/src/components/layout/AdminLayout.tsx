import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useTheme } from '../../hooks/useTheme';

export const AdminLayout: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleSidebar = () => {
    setShowMobileSidebar(prev => !prev);
  };

  return (
    <div className="app-wrapper">
      {/* Mobile overlay — closes sidebar when clicking outside */}
      {showMobileSidebar && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setShowMobileSidebar(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        showMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />

      <div className="main-wrapper">
        <Topbar
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onThemeChange={setTheme}
        />

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
