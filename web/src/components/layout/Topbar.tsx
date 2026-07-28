import React from 'react';
import { BsList, BsBell, BsPersonCircle, BsSearch } from 'react-icons/bs';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="topbar">
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-light d-lg-none p-2 rounded-circle"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <BsList size={22} />
        </button>

        <div className="d-none d-md-flex align-items-center position-relative" style={{ width: '280px' }}>
          <BsSearch className="position-absolute ms-3 text-muted" />
          <input 
            type="search" 
            className="form-control form-control-sm ps-5 rounded-pill bg-light border-0" 
            placeholder="Cari proyek, klien, atau task..."
          />
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notification Bell */}
        <button className="btn btn-light position-relative rounded-circle p-2 border-0">
          <BsBell size={18} className="text-secondary" />
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
            <span className="visually-hidden">Notifikasi Baru</span>
          </span>
        </button>

        <div className="vr d-none d-sm-block my-2 text-muted opacity-25"></div>

        {/* Admin Profile */}
        <div className="dropdown">
          <button 
            className="btn btn-link text-decoration-none text-dark d-flex align-items-center gap-2 p-0 border-0 dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <BsPersonCircle size={28} className="text-primary" />
            <div className="d-none d-sm-block text-start leading-tight">
              <div className="fw-semibold fs-7 mb-0 text-dark">Admin Bilcode</div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-8">Project Manager</span>
            </div>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
            <li><h6 className="dropdown-header">Akun Admin</h6></li>
            <li><a className="dropdown-item fs-7" href="#profile">Pengaturan Profil</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item fs-7 text-danger" href="/login">Keluar</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
};
