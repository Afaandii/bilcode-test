import React, { useState, useEffect, useRef } from 'react';
import {
  BsList,
  BsBell,
  BsSearch,
  BsBoxArrowRight,
  BsSun,
  BsMoon,
  BsLaptop,
} from 'react-icons/bs';
import { useAuth } from '../../hooks/useAuth';
import { type Theme } from '../../hooks/useTheme';

interface TopbarProps {
  onToggleSidebar: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  theme,
  onThemeChange,
}) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Get user initials for avatar
  const getInitials = (name?: string): string => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="topbar">
      {/* ── Left: Toggle + Search ── */}
      <div className="topbar-left">
        <button
          className="topbar-menu-btn d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <BsList size={20} />
        </button>

        <div className="topbar-search d-none d-md-flex">
          <BsSearch className="topbar-search-icon" />
          <input
            type="search"
            className="topbar-search-input"
            placeholder="Cari proyek, klien, atau task..."
            aria-label="Pencarian"
          />
        </div>
      </div>

      {/* ── Right: Theme + Bell + Profile ── */}
      <div className="topbar-right">

        {/* Theme Toggle */}
        <div className="theme-toggle" role="group" aria-label="Pilih tema">
          <button
            className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => onThemeChange('light')}
            title="Tema Terang"
            aria-label="Tema Terang"
            aria-pressed={theme === 'light'}
          >
            <BsSun />
          </button>
          <button
            className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => onThemeChange('dark')}
            title="Tema Gelap"
            aria-label="Tema Gelap"
            aria-pressed={theme === 'dark'}
          >
            <BsMoon />
          </button>
          <button
            className={`theme-toggle-btn ${theme === 'system' ? 'active' : ''}`}
            onClick={() => onThemeChange('system')}
            title="Ikuti Perangkat"
            aria-label="Ikuti Perangkat"
            aria-pressed={theme === 'system'}
          >
            <BsLaptop />
          </button>
        </div>

        <div className="topbar-divider" />

        {/* Notification Bell */}
        <button className="topbar-notif-btn" aria-label="Notifikasi">
          <BsBell size={16} />
          <span className="topbar-notif-badge" aria-hidden="true" />
        </button>

        <div className="topbar-divider" />

        {/* User Profile Dropdown */}
        <div className="topbar-dropdown" ref={dropdownRef}>
          <button
            className="topbar-user-btn"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            aria-label="Menu profil"
          >
            <div className="topbar-user-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="topbar-user-info d-none d-sm-block">
              <span className="topbar-user-name">{user?.name || 'Admin'}</span>
              <span className="topbar-user-badge">
                {user?.role?.toUpperCase() || 'ADMIN'}
              </span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="topbar-dropdown-menu" role="menu">
              <div className="topbar-dropdown-header">
                <span className="topbar-dropdown-email">
                  {user?.email || 'admin@example.com'}
                </span>
              </div>
              <button
                className="topbar-dropdown-item danger"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
              >
                <BsBoxArrowRight size={14} />
                Keluar (Logout)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
