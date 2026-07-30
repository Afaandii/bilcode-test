import React from "react";
import { NavLink } from "react-router-dom";
import {
  BsSpeedometer2,
  BsPeople,
  BsFolderCheck,
  BsCheck2Square,
  BsClockHistory,
  BsActivity,
} from "react-icons/bs";

interface SidebarProps {
  showMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  showMobile,
  onCloseMobile,
}) => {
  return (
    <aside className={`sidebar ${showMobile ? "show" : ""}`}>
      {/* ── Brand ── */}
      <NavLink to="/dashboard" className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <BsActivity size={20} />
        </div>
        <span className="sidebar-brand-name">ProjectPulse</span>
      </NavLink>

      {/* ── Navigation ── */}
      <div className="sidebar-nav">
        <div className="nav-section-title">Menu Utama</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsSpeedometer2 /></span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/clients"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsPeople /></span>
          <span>Manajemen Klien</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsFolderCheck /></span>
          <span>Manajemen Proyek</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsCheck2Square /></span>
          <span>Daftar &amp; Kanban Task</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onCloseMobile}
        >
          <span className="nav-icon"><BsClockHistory /></span>
          <span>Laporan Jam Kerja</span>
        </NavLink>
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">ProjectPulse v1.0 &bull; Admin</p>
      </div>
    </aside>
  );
};
