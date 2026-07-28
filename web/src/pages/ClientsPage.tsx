import React, { useState, useEffect } from "react";
import {
  BsPlusLg,
  BsPencilSquare,
  BsTrash,
  BsSearch,
  BsBuilding,
  BsEnvelope,
  BsPerson,
  BsArrowClockwise,
  BsExclamationTriangle,
  BsCheckCircle,
} from "react-icons/bs";
import { useAuth } from "../hooks/useAuth";
import {
  getClientsApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
  type ClientData,
} from "../services/clientService";

export const ClientsPage: React.FC = () => {
  const { token } = useAuth();

  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal Form States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<ClientData>({
    name: "",
    contact: "",
    company: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Delete Confirmation Modal State
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);

  const fetchClients = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getClientsApi(token);
      setClients(data);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data klien dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  // Handle Form Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setFormData({ name: "", contact: "", company: "" });
    setEditingId(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (client: ClientData) => {
    setModalMode("edit");
    setFormData({
      name: client.name,
      contact: client.contact,
      company: client.company,
    });
    setEditingId(client.id || null);
    setShowModal(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "", contact: "", company: "" });
    setEditingId(null);
  };

  // Submit Create / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (modalMode === "create") {
        const newClient = await createClientApi(token, formData);
        setClients((prev) => [newClient, ...prev]);
        setSuccessMsg(`Klien "${newClient.name}" berhasil ditambahkan.`);
      } else if (modalMode === "edit" && editingId) {
        const updatedClient = await updateClientApi(token, editingId, formData);
        setClients((prev) =>
          prev.map((c) => (c.id === editingId ? updatedClient : c)),
        );
        setSuccessMsg(
          `Data klien "${updatedClient.name}" berhasil diperbarui.`,
        );
      }
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data klien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Client
  const handleDeleteClient = async () => {
    if (!token || !clientToDelete || !clientToDelete.id) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await deleteClientApi(token, clientToDelete.id);
      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
      setSuccessMsg(`Klien "${clientToDelete.name}" berhasil dihapus.`);
      setClientToDelete(null);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus klien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search Filter
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      {/* Header Halaman */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manajemen Klien</h4>
          <p className="text-muted mb-0 fs-7">
            Kelola data seluruh klien dan kontak perusahaan mitra secara
            dinamis.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light border d-inline-flex align-items-center gap-2 rounded-3 px-3 fs-7"
            onClick={fetchClients}
            title="Refresh Data"
          >
            <BsArrowClockwise /> Refresh
          </button>
          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3"
            onClick={handleOpenCreateModal}
          >
            <BsPlusLg /> Tambah Klien Baru
          </button>
        </div>
      </div>

      {/* Alert Feedback Sukses / Error */}
      {successMsg && (
        <div
          className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 mb-4 fs-7"
          role="alert"
        >
          <BsCheckCircle size={18} />
          <div>{successMsg}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMsg(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 mb-4 fs-7"
          role="alert"
        >
          <BsExclamationTriangle size={18} />
          <div>{error}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Tabel Klien & Filter Search */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div
            className="position-relative"
            style={{ maxWidth: "340px", width: "100%" }}
          >
            <BsSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              className="form-control form-control-sm ps-5 rounded-3"
              placeholder="Cari nama, perusahaan, atau kontak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-muted fs-7">
            Menampilkan {filteredClients.length} dari {clients.length} Klien
          </span>
        </div>

        <div className="card-body p-0">
          {isLoading ? (
            <div className="py-5 text-center">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "2rem", height: "2rem" }}
              >
                <span className="visually-hidden">Memuat data klien...</span>
              </div>
              <p className="mt-2 text-muted fs-7 mb-0">
                Mengambil data klien...
              </p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-5 text-center text-muted fs-7">
              {searchTerm
                ? "Tidak ada klien yang cocok dengan kata kunci pencarian."
                : "Belum ada data klien terdaftar."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light fs-7 text-secondary">
                  <tr>
                    <th>Nama Klien</th>
                    <th>Perusahaan</th>
                    <th>Kontak / Informasi</th>
                    <th className="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody className="fs-7">
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td className="fw-semibold text-dark">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="bg-primary-subtle text-primary rounded-circle p-1.5 d-flex align-items-center justify-content-center"
                            style={{ width: "32px", height: "32px" }}
                          >
                            <BsPerson size={16} />
                          </div>
                          <span>{client.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5 text-secondary fw-medium">
                          <BsBuilding className="text-primary" />{" "}
                          {client.company}
                        </div>
                      </td>
                      <td>
                        <div className="fs-7 text-muted d-flex align-items-center gap-1.5">
                          <BsEnvelope className="text-muted" /> {client.contact}
                        </div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-light border-0 me-1"
                          title="Edit Klien"
                          onClick={() => handleOpenEditModal(client)}
                        >
                          <BsPencilSquare className="text-primary" size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Hapus Klien"
                          onClick={() => setClientToDelete(client)}
                        >
                          <BsTrash className="text-danger" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form Tambah / Edit Klien */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold text-dark fs-6">
                  {modalMode === "create"
                    ? "Tambah Klien Baru"
                    : "Edit Data Klien"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleSubmitForm}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold fs-7 text-secondary">
                      Nama Klien
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="Contoh: Bambang Susilo"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold fs-7 text-secondary">
                      Nama Perusahaan
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="company"
                      placeholder="Contoh: PT Toko Bersama"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold fs-7 text-secondary">
                      Kontak (Email / Telepon)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="contact"
                      placeholder="Contoh: bambang@tokobersama.com / 08123456789"
                      value={formData.contact}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-top py-2.5 px-4">
                  <button
                    type="button"
                    className="btn btn-light fs-7 fw-semibold"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fs-7 fw-semibold d-flex align-items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>
                        {modalMode === "create"
                          ? "Simpan Klien"
                          : "Perbarui Klien"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {clientToDelete && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex={-1}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "400px" }}
          >
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-body p-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle p-3 mb-3">
                  <BsExclamationTriangle size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Hapus Data Klien?</h5>
                <p className="text-secondary fs-7 mb-4">
                  Apakah Anda yakin ingin menghapus data klien{" "}
                  <strong>"{clientToDelete.name}"</strong>? Tindakan ini tidak
                  dapat dibatalkan.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light w-50 fs-7 fw-semibold"
                    onClick={() => setClientToDelete(null)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger w-50 fs-7 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                    onClick={handleDeleteClient}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      <span>Ya, Hapus</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
