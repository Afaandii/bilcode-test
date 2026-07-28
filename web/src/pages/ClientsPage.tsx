import React from 'react';
import { BsPlusLg, BsPencilSquare, BsTrash, BsSearch, BsBuilding, BsEnvelope, BsTelephone } from 'react-icons/bs';

export const ClientsPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Klien</h4>
          <p className="text-muted mb-0 fs-7">Kelola data seluruh klien dan kontak perusahaan mitra.</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3">
          <BsPlusLg /> Tambah Klien Baru
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="position-relative" style={{ maxWidth: '320px', width: '100%' }}>
            <BsSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input type="text" className="form-control form-control-sm ps-5 rounded-3" placeholder="Cari nama atau perusahaan..." />
          </div>
          <span className="text-muted fs-7">Menampilkan 3 Klien</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light fs-7 text-secondary">
              <tr>
                <th>Nama Klien</th>
                <th>Perusahaan</th>
                <th>Kontak</th>
                <th>Total Proyek</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody className="fs-7">
              <tr>
                <td className="fw-semibold text-dark">Bambang Susilo</td>
                <td>
                  <div className="d-flex align-items-center gap-1.5 text-secondary">
                    <BsBuilding className="text-primary" /> PT Toko Bersama
                  </div>
                </td>
                <td>
                  <div className="fs-7 text-muted">
                    <div><BsEnvelope className="me-1" /> bambang@tokobersama.com</div>
                    <div><BsTelephone className="me-1" /> +62 812-3456-7890</div>
                  </div>
                </td>
                <td><span className="badge bg-secondary-subtle text-dark">2 Proyek</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-light me-1" title="Edit"><BsPencilSquare className="text-primary" /></button>
                  <button className="btn btn-sm btn-light" title="Hapus"><BsTrash className="text-danger" /></button>
                </td>
              </tr>
              <tr>
                <td className="fw-semibold text-dark">Rina Kurnia</td>
                <td>
                  <div className="d-flex align-items-center gap-1.5 text-secondary">
                    <BsBuilding className="text-primary" /> CV Maju Jaya
                  </div>
                </td>
                <td>
                  <div className="fs-7 text-muted">
                    <div><BsEnvelope className="me-1" /> rina@majujaya.co.id</div>
                    <div><BsTelephone className="me-1" /> +62 811-9876-5432</div>
                  </div>
                </td>
                <td><span className="badge bg-secondary-subtle text-dark">1 Proyek</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-light me-1" title="Edit"><BsPencilSquare className="text-primary" /></button>
                  <button className="btn btn-sm btn-light" title="Hapus"><BsTrash className="text-danger" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
