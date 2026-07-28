import React, { useState, useEffect } from "react";
import {
  BsPlusLg,
  BsStars,
  BsFolderCheck,
  BsPencilSquare,
  BsTrash,
  BsCalendarEvent,
  BsSearch,
  BsArrowClockwise,
  BsExclamationTriangle,
  BsCheckCircle,
  BsBuilding,
  BsEye,
  BsCheckLg,
  BsLightbulb,
} from "react-icons/bs";
import { useAuth } from "../hooks/useAuth";
import {
  getProjectsApi,
  getProjectDetailApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  generateAiTasksApi,
  type Project,
  type ProjectFormData,
  type GeneratedAiTask,
  // type ProjectTask
} from "../services/projectService";
import { getClientsApi, type ClientData } from "../services/clientService";
import {
  getDashboardSummaryApi,
  type MemberWorkload,
} from "../services/dashboardService";
import { createProjectTaskApi } from "../services/taskService";

interface ProposedTask extends GeneratedAiTask {
  accepted: boolean;
  assign_id?: number;
  deadline?: string;
}

export const ProjectsPage: React.FC = () => {
  const { token } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [members, setMembers] = useState<MemberWorkload[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modal Project Form State (Create / Edit)
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [projectModalMode, setProjectModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    client_id: 0,
    name: "",
    brief: "",
    deadline: "",
    status: "active",
  });
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  // Modal AI Task Breakdown State
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [selectedProjectForAi, setSelectedProjectForAi] =
    useState<Project | null>(null);
  const [aiBriefInput, setAiBriefInput] = useState<string>("");
  const [proposedTasks, setProposedTasks] = useState<ProposedTask[]>([]);

  // Modal Detail Project State
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [projectDetail, setProjectDetail] = useState<Project | null>(null);

  // Delete Confirmation State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Initial Fetch Data
  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const [projectsData, clientsData, dashboardData] = await Promise.all([
        getProjectsApi(token),
        getClientsApi(token),
        getDashboardSummaryApi(token),
      ]);
      setProjects(projectsData);
      setClients(clientsData);
      setMembers(dashboardData.members_workload);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data proyek dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle Project Form Change
  const handleProjectInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setProjectFormData((prev) => ({
      ...prev,
      [name]: name === "client_id" ? Number(value) : value,
    }));
  };

  // Open Create Project Modal
  const handleOpenCreateModal = () => {
    setProjectModalMode("create");
    setProjectFormData({
      client_id: clients.length > 0 ? clients[0].id! : 0,
      name: "",
      brief: "",
      deadline: new Date(Date.now() + 14 * 86400000)
        .toISOString()
        .split("T")[0],
      status: "active",
    });
    setEditingProjectId(null);
    setShowProjectModal(true);
  };

  // Open Edit Project Modal
  const handleOpenEditModal = (project: Project) => {
    setProjectModalMode("edit");
    setProjectFormData({
      client_id: project.client_id,
      name: project.name,
      brief: project.brief,
      deadline: project.deadline,
      status: project.status,
    });
    setEditingProjectId(project.id);
    setShowProjectModal(true);
  };

  // Submit Project Form
  const handleSubmitProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!projectFormData.client_id || projectFormData.client_id === 0) {
      setError("Silakan pilih klien terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (projectModalMode === "create") {
        const newProject = await createProjectApi(token, projectFormData);
        setProjects((prev) => [newProject, ...prev]);
        setSuccessMsg(`Proyek "${newProject.name}" berhasil dibuat.`);
        // Ask if admin wants to run AI Task Breakdown immediately
        setSelectedProjectForAi(newProject);
        setAiBriefInput(newProject.brief);
        setShowProjectModal(false);
        setShowAiModal(true);
      } else if (projectModalMode === "edit" && editingProjectId) {
        const updatedProject = await updateProjectApi(
          token,
          editingProjectId,
          projectFormData,
        );
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProjectId ? updatedProject : p)),
        );
        setSuccessMsg(`Proyek "${updatedProject.name}" berhasil diperbarui.`);
        setShowProjectModal(false);
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data proyek.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    if (!token || !projectToDelete) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteProjectApi(token, projectToDelete.id);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setSuccessMsg(`Proyek "${projectToDelete.name}" berhasil dihapus.`);
      setProjectToDelete(null);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus proyek.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open AI Breakdown Modal for a Project
  const handleOpenAiModal = (project: Project) => {
    setSelectedProjectForAi(project);
    setAiBriefInput(project.brief || "");
    setProposedTasks([]);
    setAiError(null);
    setShowAiModal(true);
  };

  // Trigger AI Task Generation
  const handleGenerateAiTasks = async () => {
    if (!token || !selectedProjectForAi) return;

    setIsAiGenerating(true);
    setAiError(null);

    try {
      const generated = await generateAiTasksApi(
        token,
        selectedProjectForAi.id,
        aiBriefInput,
      );

      const defaultAssignId = members.length > 0 ? members[0].id : 1;
      const defaultDeadline =
        selectedProjectForAi.deadline ||
        new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

      const mapped: ProposedTask[] = generated.map((t) => ({
        ...t,
        accepted: true,
        assign_id: defaultAssignId,
        deadline: defaultDeadline,
      }));

      setProposedTasks(mapped);
    } catch (err: any) {
      setAiError(
        err.message ||
          "Gagal menghasilkan task via AI. Anda tetap dapat menambah task manual.",
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Toggle Accept/Unselect Proposed Task
  const handleToggleAcceptTask = (index: number) => {
    setProposedTasks((prev) =>
      prev.map((t, idx) =>
        idx === index ? { ...t, accepted: !t.accepted } : t,
      ),
    );
  };

  // Update Proposed Task Field
  const handleUpdateProposedTask = (
    index: number,
    field: keyof ProposedTask,
    value: any,
  ) => {
    setProposedTasks((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, [field]: value } : t)),
    );
  };

  // Remove Proposed Task Item
  const handleRemoveProposedTask = (index: number) => {
    setProposedTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add Manual Task to Proposal List
  const handleAddManualProposedTask = () => {
    const defaultAssignId = members.length > 0 ? members[0].id : 1;
    const defaultDeadline =
      selectedProjectForAi?.deadline ||
      new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    const newTask: ProposedTask = {
      title: "Task Manual Baru",
      description: "Deskripsi pekerjaan task manual.",
      category: "frontend",
      estimated_effort: "2 days",
      accepted: true,
      assign_id: defaultAssignId,
      deadline: defaultDeadline,
    };
    setProposedTasks((prev) => [...prev, newTask]);
  };

  // Save All Accepted Tasks to Backend DB
  const handleSaveAcceptedTasks = async () => {
    if (!token || !selectedProjectForAi) return;

    const acceptedList = proposedTasks.filter((t) => t.accepted);
    if (acceptedList.length === 0) {
      setAiError(
        "Silakan pilih minimal satu task yang disetujui untuk disimpan.",
      );
      return;
    }

    setIsSubmitting(true);
    setAiError(null);

    try {
      for (const taskItem of acceptedList) {
        await createProjectTaskApi(token, selectedProjectForAi.id, {
          assign_id: taskItem.assign_id || (members[0]?.id ?? 1),
          title: taskItem.title,
          description: taskItem.description,
          category: taskItem.category,
          deadline: taskItem.deadline || selectedProjectForAi.deadline,
          estimated_effort: taskItem.estimated_effort,
          status: "todo",
        });
      }

      setSuccessMsg(
        `Berhasil menyimpan ${acceptedList.length} task ke proyek "${selectedProjectForAi.name}".`,
      );
      setShowAiModal(false);
      fetchData();
    } catch (err: any) {
      setAiError(err.message || "Gagal menyimpan task proyek.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Project Detail Modal
  const handleOpenDetailModal = async (project: Project) => {
    if (!token) return;
    try {
      const fullDetail = await getProjectDetailApi(token, project.id);
      setProjectDetail(fullDetail);
      setShowDetailModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil detail proyek.");
    }
  };

  // Search & Status Filtering
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client?.company || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="badge badge-status-in_progress rounded-pill px-2.5 py-1">
            Aktif
          </span>
        );
      case "completed":
        return (
          <span className="badge badge-status-done rounded-pill px-2.5 py-1">
            Selesai
          </span>
        );
      case "on_hold":
        return (
          <span className="badge badge-status-review rounded-pill px-2.5 py-1">
            On Hold
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary rounded-pill px-2.5 py-1">
            {status}
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "frontend":
        return "bg-primary-subtle text-primary border-primary-subtle";
      case "backend":
        return "bg-info-subtle text-info border-info-subtle";
      case "design":
        return "bg-purple-subtle text-purple border-purple-subtle";
      case "QA":
        return "bg-warning-subtle text-warning border-warning-subtle";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  return (
    <div>
      {/* Header Halaman */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            Manajemen Proyek & ML Integrasi
          </h4>
          <p className="text-muted mb-0 fs-7">
            Kelola proyek dan gunakan AI LLM untuk otomatisasi task breakdown
            dari brief klien.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light border d-inline-flex align-items-center gap-2 rounded-3 px-3 fs-7"
            onClick={fetchData}
            title="Refresh Data"
          >
            <BsArrowClockwise /> Refresh
          </button>
          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3"
            onClick={handleOpenCreateModal}
          >
            <BsPlusLg /> Proyek Baru
          </button>
        </div>
      </div>

      {/* Banner Demo Fitur ML AI Task Breakdown */}
      <div className="card border-primary border-opacity-25 bg-primary bg-opacity-10 mb-4 p-3 rounded-4">
        <div className="d-flex align-items-start gap-3">
          <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
            <BsStars size={22} />
          </div>
          <div className="flex-grow-1">
            <h6 className="fw-bold text-dark mb-1">
              Fitur Integrasi ML: AI-Assisted Task Breakdown
            </h6>
            <p className="fs-7 text-secondary mb-0">
              Tempelkan brief dari klien (teks bebas). LLM API backend akan
              menganalisis dan menyarankan daftar task, kategori
              (`frontend`/`backend`/`design`/`QA`), serta estimasi effort. Anda
              dapat <strong>terima, edit, hapus, atau tambah</strong> task
              sebelum disimpan ke database.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Feedback */}
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

      {/* Filter Bar & Table Proyek */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div
            className="d-flex flex-column flex-sm-row gap-2 flex-grow-1"
            style={{ maxWidth: "600px" }}
          >
            <div className="position-relative flex-grow-1">
              <BsSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control form-control-sm ps-5 rounded-3"
                placeholder="Cari nama proyek atau klien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select form-select-sm rounded-3"
              style={{ width: "160px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          <span className="text-muted fs-7">
            Menampilkan {filteredProjects.length} dari {projects.length} Proyek
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
                <span className="visually-hidden">Memuat proyek...</span>
              </div>
              <p className="mt-2 text-muted fs-7 mb-0">
                Mengambil daftar proyek...
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-5 text-center text-muted fs-7">
              {searchTerm || statusFilter
                ? "Tidak ada proyek yang sesuai dengan kriteria filter."
                : "Belum ada proyek terdaftar."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light fs-7 text-secondary">
                  <tr>
                    <th>Nama Proyek</th>
                    <th>Klien</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th className="text-end">Aksi ML & Kelola</th>
                  </tr>
                </thead>
                <tbody className="fs-7">
                  {filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="fw-semibold text-dark">
                        <div className="d-flex align-items-center gap-2">
                          <BsFolderCheck className="text-primary" size={18} />
                          <div>
                            <div className="text-dark">{project.name}</div>
                            <small
                              className="text-muted fs-8 text-truncate d-inline-block"
                              style={{ maxWidth: "240px" }}
                            >
                              {project.brief || "Tidak ada brief"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5 text-secondary">
                          <BsBuilding className="text-primary" />{" "}
                          {project.client?.company ||
                            project.client?.name ||
                            `Klien #${project.client_id}`}
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">
                          <BsCalendarEvent className="me-1" />{" "}
                          {project.deadline}
                        </span>
                      </td>
                      <td>{getStatusBadge(project.status)}</td>
                      <td className="text-end">
                        {/* Action Buttons */}
                        <button
                          className="btn btn-sm btn-primary border-0 me-1 d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-3"
                          title="Generate Task dengan AI"
                          onClick={() => handleOpenAiModal(project)}
                        >
                          <BsStars size={14} /> AI Breakdown
                        </button>
                        <button
                          className="btn btn-sm btn-light border-0 me-1"
                          title="Lihat Detail Proyek"
                          onClick={() => handleOpenDetailModal(project)}
                        >
                          <BsEye className="text-info" size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-light border-0 me-1"
                          title="Edit Proyek"
                          onClick={() => handleOpenEditModal(project)}
                        >
                          <BsPencilSquare className="text-primary" size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Hapus Proyek"
                          onClick={() => setProjectToDelete(project)}
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

      {/* Modal Project Form (Create / Edit) */}
      {showProjectModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold text-dark fs-6">
                  {projectModalMode === "create"
                    ? "Tambah Proyek Baru"
                    : "Edit Data Proyek"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProjectModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleSubmitProjectForm}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Nama Proyek
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        placeholder="Contoh: E-Commerce Mobile App"
                        value={projectFormData.name}
                        onChange={handleProjectInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Pilih Klien
                      </label>
                      <select
                        className="form-select"
                        name="client_id"
                        value={projectFormData.client_id}
                        onChange={handleProjectInputChange}
                        required
                      >
                        {clients.length === 0 ? (
                          <option value="0">
                            Tidak ada klien (Buat klien dulu)
                          </option>
                        ) : (
                          clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.company} ({c.name})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Deadline Proyek
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="deadline"
                        value={projectFormData.deadline}
                        onChange={handleProjectInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Status Proyek
                      </label>
                      <select
                        className="form-select"
                        name="status"
                        value={projectFormData.status}
                        onChange={handleProjectInputChange}
                        required
                      >
                        <option value="active">Aktif</option>
                        <option value="completed">Selesai</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Brief Klien (Teks Bebas) &bull;{" "}
                        <span className="text-primary fw-normal fs-8">
                          Digunakan AI untuk saran breakdown task
                        </span>
                      </label>
                      <textarea
                        className="form-control"
                        name="brief"
                        rows={4}
                        placeholder="Tempelkan brief dari klien di sini. Contoh: Tolong buatkan aplikasi e-commerce mobile dengan fitur katalog produk, keranjang, checkout payment gateway Stripe, dan antarmuka desain UI/UX yang modern..."
                        value={projectFormData.brief}
                        onChange={handleProjectInputChange}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2.5 px-4">
                  <button
                    type="button"
                    className="btn btn-light fs-7 fw-semibold"
                    onClick={() => setShowProjectModal(false)}
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
                        {projectModalMode === "create"
                          ? "Simpan Proyek & Buka AI Breakdown"
                          : "Perbarui Proyek"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal AI Task Breakdown (ML Integration) */}
      {showAiModal && selectedProjectForAi && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom py-3 bg-light">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary text-white p-1.5 rounded-3 d-flex align-items-center justify-content-center">
                    <BsStars size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark fs-6 mb-0">
                      AI Task Breakdown: {selectedProjectForAi.name}
                    </h5>
                    <small className="text-muted fs-8">
                      Otomatisasi pemecahan task dari brief klien berbasis LLM
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAiModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div
                className="modal-body p-4"
                style={{ maxHeight: "75vh", overflowY: "auto" }}
              >
                {/* Input Brief Section */}
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  <label className="form-label fw-semibold fs-7 text-dark mb-1 d-flex align-items-center gap-1.5">
                    <BsLightbulb className="text-warning" /> Brief Klien Yang
                    Memicu AI:
                  </label>
                  <textarea
                    className="form-control form-control-sm mb-2"
                    rows={3}
                    value={aiBriefInput}
                    onChange={(e) => setAiBriefInput(e.target.value)}
                    placeholder="Masukkan atau sesuaikan brief proyek..."
                  ></textarea>

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted fs-8">
                      Klik tombol di kanan untuk memanggil LLM API backend.
                    </small>
                    <button
                      className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3 rounded-3"
                      onClick={handleGenerateAiTasks}
                      disabled={isAiGenerating || !aiBriefInput.trim()}
                    >
                      {isAiGenerating ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span>AI Menganalisis Brief...</span>
                        </>
                      ) : (
                        <>
                          <BsStars /> Generate Task Rekomendasi AI
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Resiliency Error Warning Alert */}
                {aiError && (
                  <div
                    className="alert alert-warning d-flex align-items-center justify-content-between rounded-3 mb-4 fs-7"
                    role="alert"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <BsExclamationTriangle
                        size={18}
                        className="text-warning flex-shrink-0"
                      />
                      <div>{aiError}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-dark fs-8 ms-2"
                      onClick={handleAddManualProposedTask}
                    >
                      + Tambah Task Manual
                    </button>
                  </div>
                )}

                {/* Results Proposal Section */}
                {proposedTasks.length > 0 && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold text-dark mb-0 fs-7">
                        Daftar Usulan Task AI (
                        {proposedTasks.filter((t) => t.accepted).length} /{" "}
                        {proposedTasks.length} Disetujui Admin)
                      </h6>
                      <button
                        className="btn btn-outline-primary btn-sm rounded-3 fs-8"
                        onClick={handleAddManualProposedTask}
                      >
                        + Tambah Usulan Task Manual
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered align-middle mb-0 fs-7">
                        <thead className="table-light text-secondary">
                          <tr>
                            <th
                              style={{ width: "40px" }}
                              className="text-center"
                            >
                              Setuju
                            </th>
                            <th>Judul Task</th>
                            <th>Deskripsi</th>
                            <th style={{ width: "130px" }}>Kategori</th>
                            <th style={{ width: "120px" }}>Estimasi Effort</th>
                            <th style={{ width: "160px" }}>Assignee Tim</th>
                            <th style={{ width: "40px" }}>Hapus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposedTasks.map((task, idx) => (
                            <tr
                              key={idx}
                              className={
                                task.accepted
                                  ? ""
                                  : "table-secondary opacity-50"
                              }
                            >
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={task.accepted}
                                  onChange={() => handleToggleAcceptTask(idx)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={task.title}
                                  onChange={(e) =>
                                    handleUpdateProposedTask(
                                      idx,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  disabled={!task.accepted}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={task.description}
                                  onChange={(e) =>
                                    handleUpdateProposedTask(
                                      idx,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  disabled={!task.accepted}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={task.category}
                                  onChange={(e) =>
                                    handleUpdateProposedTask(
                                      idx,
                                      "category",
                                      e.target.value,
                                    )
                                  }
                                  disabled={!task.accepted}
                                >
                                  <option value="frontend">Frontend</option>
                                  <option value="backend">Backend</option>
                                  <option value="design">Design</option>
                                  <option value="QA">QA</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={task.estimated_effort}
                                  onChange={(e) =>
                                    handleUpdateProposedTask(
                                      idx,
                                      "estimated_effort",
                                      e.target.value,
                                    )
                                  }
                                  disabled={!task.accepted}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={task.assign_id}
                                  onChange={(e) =>
                                    handleUpdateProposedTask(
                                      idx,
                                      "assign_id",
                                      Number(e.target.value),
                                    )
                                  }
                                  disabled={!task.accepted}
                                >
                                  {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-link text-danger p-0"
                                  onClick={() => handleRemoveProposedTask(idx)}
                                >
                                  <BsTrash size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top py-2.5 px-4 bg-light">
                <button
                  type="button"
                  className="btn btn-light fs-7 fw-semibold"
                  onClick={() => setShowAiModal(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-success fs-7 fw-semibold d-inline-flex align-items-center gap-2"
                  onClick={handleSaveAcceptedTasks}
                  disabled={
                    isSubmitting ||
                    proposedTasks.filter((t) => t.accepted).length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span>Menyimpan Task...</span>
                    </>
                  ) : (
                    <>
                      <BsCheckLg /> Simpan{" "}
                      {proposedTasks.filter((t) => t.accepted).length} Task
                      Disetujui ke Database
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Proyek & Task Terdaftar */}
      {showDetailModal && projectDetail && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom py-3">
                <div className="d-flex align-items-center gap-2">
                  <BsFolderCheck className="text-primary" size={22} />
                  <h5 className="modal-title fw-bold text-dark fs-6 mb-0">
                    Detail Proyek: {projectDetail.name}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <small className="text-muted d-block fs-8">
                      Klien Terkait
                    </small>
                    <span className="fw-semibold text-dark fs-7">
                      {projectDetail.client?.company ||
                        projectDetail.client?.name ||
                        "-"}
                    </span>
                  </div>
                  <div className="col-12 col-md-3">
                    <small className="text-muted d-block fs-8">
                      Deadline Proyek
                    </small>
                    <span className="fw-semibold text-dark fs-7">
                      {projectDetail.deadline}
                    </span>
                  </div>
                  <div className="col-12 col-md-3">
                    <small className="text-muted d-block fs-8">
                      Status Proyek
                    </small>
                    {getStatusBadge(projectDetail.status)}
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block fs-8">
                      Brief Klien
                    </small>
                    <div className="bg-light p-2.5 rounded-3 fs-7 text-secondary mt-1 border">
                      {projectDetail.brief}
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-dark fs-7 mb-2">
                  Daftar Task Terdaftar ({projectDetail.tasks?.length ?? 0})
                </h6>

                {!projectDetail.tasks || projectDetail.tasks.length === 0 ? (
                  <div className="p-3 text-center text-muted fs-7 bg-light rounded-3">
                    Belum ada task terdaftar untuk proyek ini. Klik{" "}
                    <strong>AI Breakdown</strong> untuk menambahkan task.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 fs-7 border">
                      <thead className="table-light text-secondary">
                        <tr>
                          <th>Judul Task</th>
                          <th>Kategori</th>
                          <th>Assignee</th>
                          <th>Effort</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectDetail.tasks.map((t) => (
                          <tr key={t.id}>
                            <td className="fw-semibold text-dark">{t.title}</td>
                            <td>
                              <span
                                className={`badge border ${getCategoryBadge(t.category)}`}
                              >
                                {t.category}
                              </span>
                            </td>
                            <td>{t.assignee?.name || "Belum diassign"}</td>
                            <td>{t.estimated_effort}</td>
                            <td>
                              <span className="badge bg-secondary-subtle text-dark text-capitalize">
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top py-2.5 px-4">
                <button
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 rounded-3"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenAiModal(projectDetail);
                  }}
                >
                  <BsStars /> Tambah / Breakdown Task dengan AI
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Proyek */}
      {projectToDelete && (
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
                <h5 className="fw-bold text-dark mb-2">Hapus Proyek ini?</h5>
                <p className="text-secondary fs-7 mb-4">
                  Apakah Anda yakin ingin menghapus proyek{" "}
                  <strong>"{projectToDelete.name}"</strong>? Seluruh task yang
                  terkait juga akan dihapus.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light w-50 fs-7 fw-semibold"
                    onClick={() => setProjectToDelete(null)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger w-50 fs-7 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                    onClick={handleDeleteProject}
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
