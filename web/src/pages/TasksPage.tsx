import React, { useState, useEffect } from "react";
import {
  BsPlusLg,
  BsFilter,
  BsPencilSquare,
  BsTrash,
  BsPerson,
  BsClock,
  BsSearch,
  BsArrowClockwise,
  BsExclamationTriangle,
  BsCheckCircle,
  BsEye,
  BsFolderCheck,
  BsCalendarEvent,
  BsJournalText,
  BsKanban,
  BsTable,
  BsChatLeftText,
  BsSend,
} from "react-icons/bs";
import { useAuth } from "../hooks/useAuth";
import {
  getTasksApi,
  getTaskDetailApi,
  createProjectTaskApi,
  updateTaskApi,
  deleteTaskApi,
  type FullProjectTask,
  type TaskFormData,
} from "../services/taskService";
import { getProjectsApi, type Project } from "../services/projectService";
import {
  getDashboardSummaryApi,
  type MemberWorkload,
} from "../services/dashboardService";

interface CommentItem {
  id: number;
  user_name: string;
  role: string;
  timestamp: string;
  content: string;
}

export const TasksPage: React.FC = () => {
  const { user, token } = useAuth();

  const [tasks, setTasks] = useState<FullProjectTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<MemberWorkload[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // View Mode: 'table' | 'kanban'
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");

  // Modal Form State (Create / Edit Task)
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<TaskFormData>({
    project_id: 0,
    assign_id: 0,
    title: "",
    description: "",
    category: "frontend",
    deadline: "",
    estimated_effort: "3 days",
    status: "todo",
  });
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // Modal Task Detail & Time Logs & Comments State
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [taskDetail, setTaskDetail] = useState<FullProjectTask | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "timelogs" | "comments">(
    "info",
  );
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [newCommentInput, setNewCommentInput] = useState<string>("");

  // Delete Confirmation State
  const [taskToDelete, setTaskToDelete] = useState<FullProjectTask | null>(
    null,
  );

  // Fetch Tasks & Associated Data
  const fetchTasksData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const [tasksData, projectsData, dashboardData] = await Promise.all([
        getTasksApi(token, {
          project_id: selectedProjectId,
          status: selectedStatus,
          assignee: selectedAssignee,
        }),
        getProjectsApi(token),
        getDashboardSummaryApi(token),
      ]);

      setTasks(tasksData);
      setProjects(projectsData);
      setMembers(dashboardData.members_workload);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data task dari backend API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, [token, selectedProjectId, selectedStatus, selectedAssignee]);

  // Handle Form Change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "project_id" || name === "assign_id" ? Number(value) : value,
    }));
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setFormData({
      project_id: projects.length > 0 ? projects[0].id : 0,
      assign_id: members.length > 0 ? members[0].id : 0,
      title: "",
      description: "",
      category: "frontend",
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      estimated_effort: "3 days",
      status: "todo",
    });
    setEditingTaskId(null);
    setShowTaskModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task: FullProjectTask) => {
    setModalMode("edit");
    setFormData({
      project_id: task.project_id,
      assign_id: task.assign_id || (members[0]?.id ?? 0),
      title: task.title,
      description: task.description,
      category: task.category,
      deadline: task.deadline || new Date().toISOString().split("T")[0],
      estimated_effort: task.estimated_effort,
      status: task.status,
    });
    setEditingTaskId(task.id!);
    setShowTaskModal(true);
  };

  // Submit Task Form
  const handleSubmitTaskForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (
      modalMode === "create" &&
      (!formData.project_id || formData.project_id === 0)
    ) {
      setError("Silakan pilih proyek terlebih dahulu.");
      return;
    }

    if (!formData.assign_id || formData.assign_id === 0) {
      setError("Silakan pilih penanggung jawab (assignee) terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (modalMode === "create") {
        await createProjectTaskApi(token, formData.project_id!, formData);
        setSuccessMsg(`Task "${formData.title}" berhasil ditambahkan.`);
      } else if (modalMode === "edit" && editingTaskId) {
        await updateTaskApi(token, editingTaskId, formData);
        setSuccessMsg(`Task "${formData.title}" berhasil diperbarui.`);
      }
      setShowTaskModal(false);
      fetchTasksData();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!token || !taskToDelete || !taskToDelete.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteTaskApi(token, taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setSuccessMsg(`Task "${taskToDelete.title}" berhasil dihapus.`);
      setTaskToDelete(null);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Task Detail Modal
  const handleOpenDetailModal = async (task: FullProjectTask) => {
    if (!token || !task.id) return;
    try {
      const fullDetail = await getTaskDetailApi(token, task.id);
      setTaskDetail(fullDetail);
      setActiveTab("info");

      // Default discussion comments list
      setCommentsList([
        {
          id: 1,
          user_name: fullDetail.assignee?.name || "Developer",
          role: "Member",
          timestamp: "Kemarin 14:30",
          content: `Progres task "${fullDetail.title}" sedang dalam pengerjaan. Mohon dipantau.`,
        },
        {
          id: 2,
          user_name: user?.name || "Admin",
          role: "Admin / PM",
          timestamp: "Hari ini 09:15",
          content:
            "Siap, pastikan fitur ini telah dites dengan baik sebelum dinaikkan ke status Review.",
        },
      ]);
      setNewCommentInput("");
      setShowDetailModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil detail task.");
    }
  };

  // Submit New Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;

    const newComment: CommentItem = {
      id: Date.now(),
      user_name: user?.name || "Admin ProjectPulse",
      role: "Admin / PM",
      timestamp: "Baru saja",
      content: newCommentInput.trim(),
    };

    setCommentsList((prev) => [...prev, newComment]);
    setNewCommentInput("");
  };

  // Drag and Drop Handler for Kanban Board
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropTask = async (
    e: React.DragEvent,
    targetStatus: "todo" | "in_progress" | "review" | "done",
  ) => {
    e.preventDefault();
    if (!token) return;

    const taskIdStr = e.dataTransfer.getData("text/plain");
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr, 10);
    const targetTask = tasks.find((t) => t.id === taskId);

    if (!targetTask || targetTask.status === targetStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t)),
    );

    try {
      await updateTaskApi(token, taskId, { status: targetStatus });
      setSuccessMsg(
        `Status task "${targetTask.title}" diperbarui ke ${targetStatus.toUpperCase()}`,
      );
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui status task via Kanban.");
      fetchTasksData(); // revert on error
    }
  };

  // Search Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesKeyword =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesKeyword;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return (
          <span className="badge badge-status-todo rounded-pill px-2.5 py-1">
            To Do
          </span>
        );
      case "in_progress":
        return (
          <span className="badge badge-status-in_progress rounded-pill px-2.5 py-1">
            In Progress
          </span>
        );
      case "review":
        return (
          <span className="badge badge-status-review rounded-pill px-2.5 py-1">
            Review
          </span>
        );
      case "done":
        return (
          <span className="badge badge-status-done rounded-pill px-2.5 py-1">
            Done
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
        return "bg-purple-subtle text-secondary border-purple-subtle";
      case "QA":
        return "bg-warning-subtle text-warning border-warning-subtle";
      default:
        return "bg-secondary-subtle text-purple";
    }
  };

  // Kanban Columns List
  const kanbanColumns: Array<{
    status: "todo" | "in_progress" | "review" | "done";
    title: string;
    colorClass: string;
  }> = [
    {
      status: "todo",
      title: "To Do",
      colorClass: "border-top border-4 border-secondary",
    },
    {
      status: "in_progress",
      title: "In Progress",
      colorClass: "border-top border-4 border-primary",
    },
    {
      status: "review",
      title: "Review",
      colorClass: "border-top border-4 border-warning",
    },
    {
      status: "done",
      title: "Done",
      colorClass: "border-top border-4 border-success",
    },
  ];

  return (
    <div>
      {/* Header Halaman */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            Manajemen Task & Papan Kanban
          </h4>
          <p className="text-muted mb-0 fs-7">
            Kelola task dengan mode Tabel atau Papan Kanban Drag-and-Drop secara
            visual.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* View Mode Switch Button */}
          <div className="btn-group p-1 bg-light rounded-3 border" role="group">
            <button
              className={`btn btn-sm ${viewMode === "table" ? "btn-white shadow-sm fw-bold text-primary" : "text-secondary"}`}
              onClick={() => setViewMode("table")}
            >
              <BsTable className="me-1" /> Tabel View
            </button>
            <button
              className={`btn btn-sm ${viewMode === "kanban" ? "btn-white shadow-sm fw-bold text-primary" : "text-secondary"}`}
              onClick={() => setViewMode("kanban")}
            >
              <BsKanban className="me-1" /> Kanban Board
            </button>
          </div>

          <button
            className="btn btn-light border d-inline-flex align-items-center gap-2 rounded-3 px-3 fs-7"
            onClick={fetchTasksData}
            title="Refresh Data"
          >
            <BsArrowClockwise /> Refresh
          </button>

          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3"
            onClick={handleOpenCreateModal}
          >
            <BsPlusLg /> Tambah Task Manual
          </button>
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

      {/* Multi-level Filter Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center gap-2 text-secondary fw-semibold fs-7 me-2">
              <BsFilter size={18} /> Filter Task:
            </div>

            {/* Search Keyword Input */}
            <div className="col-12 col-sm-6 col-md-3">
              <div className="position-relative">
                <BsSearch
                  className="position-absolute top-50 start-0 translate-middle-y ms-2.5 text-muted"
                  size={14}
                />
                <input
                  type="text"
                  className="form-control form-control-sm ps-4.5 rounded-3"
                  placeholder="Cari judul / deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Project Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm rounded-3"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">Semua Proyek ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm rounded-3"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm rounded-3"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
              >
                <option value="">Semua Assignee</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER TABLE VIEW OR KANBAN BOARD */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0 text-dark">
              Daftar Penugasan Task (Tabel)
            </h6>
            <span className="text-muted fs-7">
              Menampilkan {filteredTasks.length} dari {tasks.length} Task
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
                  <span className="visually-hidden">Memuat task...</span>
                </div>
                <p className="mt-2 text-muted fs-7 mb-0">
                  Mengambil daftar task...
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-5 text-center text-muted fs-7">
                Belum ada task yang sesuai dengan kriteria filter.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 fs-7">
                  <thead className="table-light text-secondary">
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
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="fw-semibold text-dark">
                          <div>
                            <div>{task.title}</div>
                            <small
                              className="text-muted fs-8 text-truncate d-inline-block"
                              style={{ maxWidth: "240px" }}
                            >
                              {task.description}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1.5 text-secondary">
                            <BsFolderCheck className="text-primary" />
                            <span>
                              {task.project?.name ||
                                `Proyek #${task.project_id}`}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge border ${getCategoryBadge(task.category)}`}
                          >
                            {task.category}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1.5 text-secondary">
                            <BsPerson className="text-primary" />{" "}
                            {task.assignee?.name || "Belum diassign"}
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">
                            <BsClock className="me-1" /> {task.deadline || "-"}
                          </span>
                        </td>
                        <td>{getStatusBadge(task.status)}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-light border-0 me-1"
                            title="Detail Task & Diskusi"
                            onClick={() => handleOpenDetailModal(task)}
                          >
                            <BsEye className="text-info" size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0 me-1"
                            title="Edit Task"
                            onClick={() => handleOpenEditModal(task)}
                          >
                            <BsPencilSquare
                              className="text-primary"
                              size={16}
                            />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Hapus Task"
                            onClick={() => setTaskToDelete(task)}
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
      ) : (
        /* KANBAN BOARD DRAG-AND-DROP VIEW */
        <div>
          <div className="alert alert-info py-2 px-3 fs-7 mb-3 rounded-3 d-flex align-items-center gap-2">
            <BsKanban className="flex-shrink-0" />
            <div>
              <strong>Petunjuk Kanban Drag-and-Drop:</strong> Anda dapat
              menggeser (*drag*) kartu task dan melepasnya (*drop*) pada kolom
              status yang diinginkan untuk memperbarui status secara instan!
            </div>
          </div>

          <div className="row g-3">
            {kanbanColumns.map((col) => {
              const colTasks = filteredTasks.filter(
                (t) => t.status === col.status,
              );

              return (
                <div key={col.status} className="col-12 col-md-6 col-xl-3">
                  <div
                    className={`card bg-light shadow-sm rounded-4 ${col.colorClass}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropTask(e, col.status)}
                    style={{ minHeight: "520px" }}
                  >
                    <div className="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
                      <h6 className="fw-bold mb-0 text-dark fs-7 d-flex align-items-center gap-2">
                        <span>{col.title}</span>
                        <span className="badge bg-secondary-subtle text-dark rounded-pill fs-8">
                          {colTasks.length}
                        </span>
                      </h6>
                    </div>

                    <div
                      className="card-body p-2.5 d-flex flex-column gap-2 overflow-y-auto"
                      style={{ maxHeight: "70vh" }}
                    >
                      {colTasks.length === 0 ? (
                        <div className="p-4 text-center text-muted fs-8 border border-dashed rounded-3 bg-white">
                          Tarik task ke sini
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <div
                            key={task.id}
                            className="card border-0 shadow-sm rounded-3 p-3 bg-white cursor-grab"
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, task.id!)}
                            style={{ cursor: "grab" }}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span
                                className={`badge border fs-8 ${getCategoryBadge(task.category)}`}
                              >
                                {task.category}
                              </span>
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-link text-muted p-0 border-0"
                                  onClick={() => handleOpenDetailModal(task)}
                                >
                                  <BsEye size={14} className="text-info" />
                                </button>
                                <button
                                  className="btn btn-sm btn-link text-muted p-0 border-0 ms-1"
                                  onClick={() => handleOpenEditModal(task)}
                                >
                                  <BsPencilSquare
                                    size={14}
                                    className="text-primary"
                                  />
                                </button>
                              </div>
                            </div>

                            <h6 className="fw-bold text-dark fs-7 mb-1">
                              {task.title}
                            </h6>
                            <p
                              className="text-muted fs-8 text-truncate mb-2"
                              style={{ maxWidth: "100%" }}
                            >
                              {task.description}
                            </p>

                            <div className="fs-8 text-secondary border-top pt-2 mt-1 d-flex justify-content-between align-items-center">
                              <span className="d-flex align-items-center gap-1">
                                <BsPerson className="text-primary" />{" "}
                                {task.assignee?.name?.split(" ")[0] || "Member"}
                              </span>
                              <span className="text-muted">
                                <BsClock className="me-1" />{" "}
                                {task.deadline || "-"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Form Task (Create / Edit) */}
      {showTaskModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold text-dark fs-6">
                  {modalMode === "create"
                    ? "Tambah Task Manual"
                    : "Edit Data Task"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTaskModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleSubmitTaskForm}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {modalMode === "create" && (
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold fs-7 text-secondary">
                          Pilih Proyek
                        </label>
                        <select
                          className="form-select"
                          name="project_id"
                          value={formData.project_id}
                          onChange={handleInputChange}
                          required
                        >
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div
                      className={
                        modalMode === "create" ? "col-12 col-md-6" : "col-12"
                      }
                    >
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Judul Task
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        placeholder="Contoh: Implementasi Form Validation Login"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Deskripsi Pekerjaan
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows={3}
                        placeholder="Rincian deskripsi pekerjaan yang harus diselesaikan anggota tim..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Kategori Task
                      </label>
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="design">Design</option>
                        <option value="QA">QA</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Assignee (Anggota Tim)
                      </label>
                      <select
                        className="form-select"
                        name="assign_id"
                        value={formData.assign_id}
                        onChange={handleInputChange}
                        required
                      >
                        {members.length === 0 ? (
                          <option value="0">
                            Tidak ada anggota tim terdaftar
                          </option>
                        ) : (
                          members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.email})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Deadline Task
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Estimasi Effort
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="estimated_effort"
                        placeholder="Contoh: 2 days / 5 hours"
                        value={formData.estimated_effort}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Status Status
                      </label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2.5 px-4">
                  <button
                    type="button"
                    className="btn btn-light fs-7 fw-semibold"
                    onClick={() => setShowTaskModal(false)}
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
                          ? "Simpan Task Baru"
                          : "Perbarui Task"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Task, Time Logs & Komentar Diskusi */}
      {showDetailModal && taskDetail && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom py-3">
                <div className="d-flex align-items-center gap-2">
                  <BsJournalText className="text-primary" size={22} />
                  <div>
                    <h5 className="modal-title fw-bold text-dark fs-6 mb-0">
                      Detail Task: {taskDetail.title}
                    </h5>
                    <small className="text-muted fs-8">
                      {taskDetail.project?.name}
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              {/* Tab Navigation Navigation inside Modal */}
              <div className="px-4 pt-3 border-bottom bg-light">
                <ul className="nav nav-tabs border-0">
                  <li className="nav-item">
                    <button
                      className={`nav-link fs-7 fw-semibold ${activeTab === "info" ? "active text-primary border-bottom border-primary border-2" : "text-secondary"}`}
                      onClick={() => setActiveTab("info")}
                    >
                      <BsFolderCheck className="me-1" /> Informasi Task
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link fs-7 fw-semibold ${activeTab === "timelogs" ? "active text-primary border-bottom border-primary border-2" : "text-secondary"}`}
                      onClick={() => setActiveTab("timelogs")}
                    >
                      <BsClock className="me-1" /> Log Jam Kerja
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link fs-7 fw-semibold ${activeTab === "comments" ? "active text-primary border-bottom border-primary border-2" : "text-secondary"}`}
                      onClick={() => setActiveTab("comments")}
                    >
                      <BsChatLeftText className="me-1" /> Diskusi & Komentar (
                      {commentsList.length})
                    </button>
                  </li>
                </ul>
              </div>

              <div
                className="modal-body p-4"
                style={{ maxHeight: "65vh", overflowY: "auto" }}
              >
                {/* TAB 1: INFORMASI TASK */}
                {activeTab === "info" && (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <small className="text-muted d-block fs-8">
                        Proyek Terkait
                      </small>
                      <span className="fw-semibold text-dark fs-7 d-flex align-items-center gap-1.5">
                        <BsFolderCheck className="text-primary" />{" "}
                        {taskDetail.project?.name ||
                          `Proyek #${taskDetail.project_id}`}
                      </span>
                    </div>
                    <div className="col-12 col-md-6">
                      <small className="text-muted d-block fs-8">
                        Penanggung Jawab (Assignee)
                      </small>
                      <span className="fw-semibold text-dark fs-7 d-flex align-items-center gap-1.5">
                        <BsPerson className="text-primary" />{" "}
                        {taskDetail.assignee?.name || "Belum diassign"} (
                        {taskDetail.assignee?.email})
                      </span>
                    </div>
                    <div className="col-12 col-md-4">
                      <small className="text-muted d-block fs-8">
                        Kategori
                      </small>
                      <span
                        className={`badge border ${getCategoryBadge(taskDetail.category)}`}
                      >
                        {taskDetail.category}
                      </span>
                    </div>
                    <div className="col-12 col-md-4">
                      <small className="text-muted d-block fs-8">
                        Deadline & Effort
                      </small>
                      <span className="fw-semibold text-dark fs-7">
                        <BsCalendarEvent className="me-1" />{" "}
                        {taskDetail.deadline} ({taskDetail.estimated_effort})
                      </span>
                    </div>
                    <div className="col-12 col-md-4">
                      <small className="text-muted d-block fs-8">
                        Status Status
                      </small>
                      {getStatusBadge(taskDetail.status)}
                    </div>
                    <div className="col-12">
                      <small className="text-muted d-block fs-8">
                        Deskripsi Task
                      </small>
                      <div className="bg-light p-3 rounded-3 fs-7 text-secondary mt-1 border">
                        {taskDetail.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TIME LOGS */}
                {activeTab === "timelogs" && (
                  <div>
                    {(!taskDetail.time_logs && !taskDetail.timeLogs) ||
                    (taskDetail.time_logs?.length === 0 &&
                      taskDetail.timeLogs?.length === 0) ? (
                      <div className="p-4 text-center text-muted fs-7 bg-light rounded-3">
                        Belum ada log waktu kerja yang dicatat oleh anggota tim
                        untuk task ini.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 fs-7 border">
                          <thead className="table-light text-secondary">
                            <tr>
                              <th>Anggota Tim</th>
                              <th>Catatan Progres</th>
                              <th>Jam Kerja</th>
                              <th>Tanggal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(
                              taskDetail.time_logs ||
                              taskDetail.timeLogs ||
                              []
                            ).map((log) => (
                              <tr key={log.id}>
                                <td className="fw-semibold text-dark">
                                  {log.user?.name || "Anggota"}
                                </td>
                                <td>{log.description}</td>
                                <td>
                                  <span className="badge bg-info-subtle text-info border border-info-subtle">
                                    {log.hours}
                                  </span>
                                </td>
                                <td className="text-muted fs-8">
                                  {log.created_at
                                    ? new Date(
                                        log.created_at,
                                      ).toLocaleDateString("id-ID")
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: DISKUSI & KOMENTAR KOLABORATIF */}
                {activeTab === "comments" && (
                  <div>
                    {/* List Komentar */}
                    <div className="d-flex flex-column gap-3 mb-4">
                      {commentsList.map((comment) => (
                        <div
                          key={comment.id}
                          className="d-flex gap-3 p-3 bg-light rounded-3 border"
                        >
                          <div
                            className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: "36px", height: "36px" }}
                          >
                            <BsPerson size={20} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div className="fw-semibold text-dark fs-7">
                                {comment.user_name}{" "}
                                <span className="badge bg-secondary-subtle text-dark fs-8 ms-1">
                                  {comment.role}
                                </span>
                              </div>
                              <small className="text-muted fs-8">
                                {comment.timestamp}
                              </small>
                            </div>
                            <p className="fs-7 text-secondary mb-0">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input Komentar Baru */}
                    <form onSubmit={handleAddComment} className="mt-3">
                      <label className="form-label fw-semibold fs-7 text-secondary">
                        Kirim Komentar / Instruksi Tim
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Tulis pesan atau feedback untuk task ini..."
                          value={newCommentInput}
                          onChange={(e) => setNewCommentInput(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 px-3"
                        >
                          <BsSend /> Kirim
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top py-2.5 px-4">
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

      {/* Modal Konfirmasi Hapus Task */}
      {taskToDelete && (
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
                <h5 className="fw-bold text-dark mb-2">Hapus Task ini?</h5>
                <p className="text-secondary fs-7 mb-4">
                  Apakah Anda yakin ingin menghapus task{" "}
                  <strong>"{taskToDelete.title}"</strong>? Tindakan ini tidak
                  dapat dibatalkan.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light w-50 fs-7 fw-semibold"
                    onClick={() => setTaskToDelete(null)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger w-50 fs-7 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                    onClick={handleDeleteTask}
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
