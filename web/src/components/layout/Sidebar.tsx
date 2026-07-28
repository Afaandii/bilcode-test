import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BsSpeedometer2, 
  BsPeople, 
  BsFolderCheck, 
  BsCheck2Square, 
  BsClockHistory,
  BsBoxArrowRight,
  BsActivity
} from 'react-icons/bs';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  showMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ showMobile, onCloseMobile }) => {
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    onCloseMobile();
    logout();
  };

  return (
    <aside className={`sidebar ${showMobile ? 'show' : ''}`}>
      <NavLink to="/dashboard" className="sidebar-brand">
        <div className="brand-icon">
          <BsActivity size={22} />
        </div>
        <span>ProjectPulse</span>
      </NavLink>

      <div className="sidebar-nav">
        <div className="nav-section-title">Menu Utama</div>
        
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsSpeedometer2 /></span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/clients" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsPeople /></span>
          <span>Manajemen Klien</span>
        </NavLink>

        <NavLink 
          to="/projects" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsFolderCheck /></span>
          <span>Manajemen Proyek</span>
        </NavLink>

        <NavLink 
          to="/tasks" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsCheck2Square /></span>
          <span>Daftar & Kanban Task</span>
        </NavLink>

        <NavLink 
          to="/reports" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsClockHistory /></span>
          <span>Laporan Jam Kerja</span>
        </NavLink>

        <div className="nav-section-title mt-4">Sistem</div>

        <button 
          className="nav-link text-danger border-0 bg-transparent w-100 mt-2"
          onClick={handleLogout}
        >
          <span className="nav-icon"><BsBoxArrowRight /></span>
          <span>Keluar (Logout)</span>
        </button>
      </div>

      <div className="p-3 border-top border-secondary border-opacity-25 fs-7 text-secondary text-center">
        <small>ProjectPulse v1.0 &bull; Admin</small>
      </div>
    </aside>
  );
};
