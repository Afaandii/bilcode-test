import React from 'react';
import { BsPlusLg, BsStars, BsFolderCheck, BsPencilSquare, BsTrash, BsCalendarEvent } from 'react-icons/bs';

export const ProjectsPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Proyek</h4>
          <p className="text-muted mb-0 fs-7">Kelola proyek aktif dan gunakan AI Task Breakdown dari brief klien.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2 rounded-3 px-3">
            <BsStars className="text-primary" /> AI Task Breakdown
          </button>
          <button className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3">
            <BsPlusLg /> Proyek Baru
          </button>
        </div>
      </div>

      {/* Card AI Brief Demo Banner */}
      <div className="card border-primary border-opacity-25 bg-primary bg-opacity-10 mb-4 p-3 rounded-4">
        <div className="d-flex align-items-start gap-3">
          <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
            <BsStars size={20} />
          </div>
          <div>
            <h6 className="fw-bold text-dark mb-1">Fitur ML Integrasi: AI-Assisted Task Breakdown</h6>
            <p className="fs-7 text-secondary mb-0">
              Tempelkan brief dari klien dalam teks bebas saat membuat proyek baru. AI akan menganalisis dan menyarankan daftar task, kategori (`frontend`, `backend`, `design`, `QA`), serta estimasi effort!
            </p>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light fs-7 text-secondary">
              <tr>
                <th>Nama Proyek</th>
                <th>Klien</th>
                <th>Deadline</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody className="fs-7">
              <tr>
                <td className="fw-semibold text-dark">
                  <div className="d-flex align-items-center gap-2">
                    <BsFolderCheck className="text-primary" />
                    <span>E-Commerce Mobile App</span>
                  </div>
                </td>
                <td>PT Toko Bersama</td>
                <td><BsCalendarEvent className="me-1 text-muted" /> 15 Agu 2026</td>
                <td><span className="badge badge-status-in_progress rounded-pill px-2.5 py-1">In Progress</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-light me-1"><BsPencilSquare className="text-primary" /></button>
                  <button className="btn btn-sm btn-light"><BsTrash className="text-danger" /></button>
                </td>
              </tr>
              <tr>
                <td className="fw-semibold text-dark">
                  <div className="d-flex align-items-center gap-2">
                    <BsFolderCheck className="text-primary" />
                    <span>Company Profile Refresh</span>
                  </div>
                </td>
                <td>CV Maju Jaya</td>
                <td><BsCalendarEvent className="me-1 text-muted" /> 10 Agu 2026</td>
                <td><span className="badge badge-status-review rounded-pill px-2.5 py-1">Review</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-light me-1"><BsPencilSquare className="text-primary" /></button>
                  <button className="btn btn-sm btn-light"><BsTrash className="text-danger" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
