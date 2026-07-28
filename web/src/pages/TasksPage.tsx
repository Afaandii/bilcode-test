import React from 'react';
import { BsPlusLg, BsFilter, BsPencilSquare, BsTrash, BsPerson, BsClock } from 'react-icons/bs';

export const TasksPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Daftar Task Proyek</h4>
          <p className="text-muted mb-0 fs-7">Kelola penugasan, deadline, dan pantau progres status task anggota tim.</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3">
          <BsPlusLg /> Tambah Task Manual
        </button>
      </div>

      {/* Bar Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center gap-2 text-secondary fw-semibold fs-7 me-2">
              <BsFilter size={18} /> Filter Task:
            </div>
            <div className="col-12 col-sm-4 col-md-3">
              <select className="form-select form-select-sm rounded-3">
                <option value="">Semua Proyek</option>
                <option value="1">E-Commerce Mobile App</option>
                <option value="2">Company Profile Refresh</option>
              </select>
            </div>
            <div className="col-12 col-sm-4 col-md-3">
              <select className="form-select form-select-sm rounded-3">
                <option value="">Semua Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="col-12 col-sm-4 col-md-3">
              <select className="form-select form-select-sm rounded-3">
                <option value="">Semua Assignee</option>
                <option value="budi">Budi Santoso</option>
                <option value="siti">Siti Rahma</option>
                <option value="andi">Andi Wijaya</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Task */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light fs-7 text-secondary">
              <tr>
                <th>Judul Task</th>
                <th>Proyek</th>
                <th>Kategori</th>
                <th>Assignee</th>
                <th>Deadline</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody className="fs-7">
              <tr>
                <td className="fw-semibold text-dark">Desain UI Kit & Flow Checkout</td>
                <td>E-Commerce Mobile App</td>
                <td><span className="badge bg-purple-subtle text-purple border border-purple-subtle">Design</span></td>
                <td>
                  <div className="d-flex align-items-center gap-1.5 text-secondary">
                    <BsPerson className="text-primary" /> Andi Wijaya
                  </div>
                </td>
                <td><BsClock className="me-1 text-muted" /> 05 Agu 2026</td>
                <td><span className="badge badge-status-in_progress rounded-pill px-2.5 py-1">In Progress</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-light me-1"><BsPencilSquare className="text-primary" /></button>
                  <button className="btn btn-sm btn-light"><BsTrash className="text-danger" /></button>
                </td>
              </tr>
              <tr>
                <td className="fw-semibold text-dark">Setup REST API Payment Gateway</td>
                <td>E-Commerce Mobile App</td>
                <td><span className="badge bg-info-subtle text-info border border-info-subtle">Backend</span></td>
                <td>
                  <div className="d-flex align-items-center gap-1.5 text-secondary">
                    <BsPerson className="text-primary" /> Siti Rahma
                  </div>
                </td>
                <td><BsClock className="me-1 text-muted" /> 08 Agu 2026</td>
                <td><span className="badge badge-status-todo rounded-pill px-2.5 py-1">To Do</span></td>
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
