import React, { useState, useEffect, useRef } from "react";
import {
  BsList,
  BsSearch,
  BsBoxArrowRight,
  BsSun,
  BsMoon,
  BsLaptop,
  BsBell,
} from "react-icons/bs";
import { useAuth } from "../../hooks/useAuth";
import { type Theme } from "../../hooks/useTheme";
import { SearchModal } from "./SearchModal";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Global Ctrl + K / Cmd + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Get user initials for avatar
  const getInitials = (name?: string): string => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <>
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

          {/* Desktop Search Trigger */}
          <div
            className="topbar-search d-none d-md-flex"
            onClick={() => setIsSearchOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Buka pencarian global"
          >
            <BsSearch className="topbar-search-icon" />
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Cari proyek, klien, atau task..."
              readOnly
              aria-label="Pencarian"
            />
            <span className="topbar-search-shortcut">
              <kbd>Ctrl</kbd> <kbd>K</kbd>
            </span>
          </div>

          {/* Mobile Search Trigger Icon */}
          <button
            className="topbar-notif-btn d-flex d-md-none"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Buka Pencarian"
            title="Pencarian"
          >
            <BsSearch size={16} />
          </button>
        </div>

        {/* ── Right: Theme + Bell + Profile ── */}
        <div className="topbar-right">
          {/* Theme Toggle */}
          <div className="theme-toggle" role="group" aria-label="Pilih tema">
            <button
              className={`theme-toggle-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => onThemeChange("light")}
              title="Tema Terang"
              aria-label="Tema Terang"
              aria-pressed={theme === "light"}
            >
              <BsSun />
            </button>
            <button
              className={`theme-toggle-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => onThemeChange("dark")}
              title="Tema Gelap"
              aria-label="Tema Gelap"
              aria-pressed={theme === "dark"}
            >
              <BsMoon />
            </button>
            <button
              className={`theme-toggle-btn ${theme === "system" ? "active" : ""}`}
              onClick={() => onThemeChange("system")}
              title="Ikuti Perangkat"
              aria-label="Ikuti Perangkat"
              aria-pressed={theme === "system"}
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
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              aria-label="Menu profil"
            >
              <div className="topbar-user-avatar">{getInitials(user?.name)}</div>
              <div className="topbar-user-info d-none d-sm-block">
                <span className="topbar-user-name">{user?.name || "Admin"}</span>
                <span className="topbar-user-badge">
                  {user?.role?.toUpperCase() || "ADMIN"}
                </span>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="topbar-dropdown-menu" role="menu">
                <div className="topbar-dropdown-header">
                  <span className="topbar-dropdown-email">
                    {user?.email || "admin@example.com"}
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

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
