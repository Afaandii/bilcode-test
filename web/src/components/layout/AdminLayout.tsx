import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AdminLayout: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowMobileSidebar(prev => !prev);
  };

  return (
    <div className="app-wrapper">
      <Sidebar 
        showMobile={showMobileSidebar} 
        onCloseMobile={() => setShowMobileSidebar(false)} 
      />
      
      <div className="main-wrapper">
        <Topbar onToggleSidebar={toggleSidebar} />
        
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
