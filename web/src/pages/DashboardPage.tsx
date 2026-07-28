import React from 'react';
import { 
  BsFolderCheck, 
  BsExclamationTriangle, 
  BsPeople, 
  BsCheckCircle,
  BsPlusLg
} from 'react-icons/bs';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div>
      {/* Header Halaman */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Dashboard Ringkasan</h4>
          <p className="text-muted mb-0 fs-7">Pantau statistik proyek aktif, tugas overdue, dan beban kerja tim.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/projects" className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3">
            <BsPlusLg /> Proyek Baru
          </Link>
        </div>
      </div>

      {/* Ringkasan Kartu Statistik */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fs-7 fw-semibold">Proyek Aktif</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">8</h3>
              </div>
              <div className="stat-icon-wrapper bg-primary-subtle text-primary">
                <BsFolderCheck />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fs-7 fw-semibold">Task Overdue</span>
                <h3 className="fw-bold text-danger mt-1 mb-0">3</h3>
              </div>
              <div className="stat-icon-wrapper bg-danger-subtle text-danger">
                <BsExclamationTriangle />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fs-7 fw-semibold">Task Selesai</span>
                <h3 className="fw-bold text-success mt-1 mb-0">24</h3>
              </div>
              <div className="stat-icon-wrapper bg-success-subtle text-success">
                <BsCheckCircle />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fs-7 fw-semibold">Total Anggota</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">12</h3>
              </div>
              <div className="stat-icon-wrapper bg-info-subtle text-info">
                <BsPeople />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Baris Konten: Proyek Aktif & Workload */}
      <div className="row g-4">
        {/* Kolom Kiri: Proyek Terbaru */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-bold mb-0 text-dark">Proyek Aktif Terbaru</h6>
              <Link to="/projects" className="fs-7 text-primary text-decoration-none fw-semibold">Lihat Semua</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-secondary">
                    <tr>
                      <th>Nama Proyek</th>
                      <th>Klien</th>
                      <th>Deadline</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="fs-7">
                    <tr>
                      <td className="fw-semibold text-dark">E-Commerce Mobile App</td>
                      <td>PT Toko Bersama</td>
                      <td>15 Agu 2026</td>
                      <td><span className="badge badge-status-in_progress rounded-pill px-2.5 py-1">In Progress</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold text-dark">Company Profile Refresh</td>
                      <td>CV Maju Jaya</td>
                      <td>10 Agu 2026</td>
                      <td><span className="badge badge-status-review rounded-pill px-2.5 py-1">Review</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold text-dark">CRM Internal Dashboard</td>
                      <td>PT Megah Finance</td>
                      <td>01 Agu 2026</td>
                      <td><span className="badge bg-danger-subtle text-danger rounded-pill px-2.5 py-1">Overdue</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Workload Anggota Tim */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0 text-dark">Beban Kerja Tim (Workload)</h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="d-flex justify-content-between fs-7 mb-1">
                    <span className="fw-semibold text-dark">Budi Santoso (Frontend)</span>
                    <span className="text-muted">5 Task (80%)</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-warning" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between fs-7 mb-1">
                    <span className="fw-semibold text-dark">Siti Rahma (Backend)</span>
                    <span className="text-muted">3 Task (50%)</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-primary" style={{ width: '50%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between fs-7 mb-1">
                    <span className="fw-semibold text-dark">Andi Wijaya (UI/UX)</span>
                    <span className="text-muted">6 Task (95%)</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-danger" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between fs-7 mb-1">
                    <span className="fw-semibold text-dark">Dewi Lestari (QA)</span>
                    <span className="text-muted">2 Task (30%)</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
