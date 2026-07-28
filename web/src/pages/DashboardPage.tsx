import React, { useState, useEffect } from "react";
import {
  BsFolderCheck,
  BsExclamationTriangle,
  BsPeople,
  BsBriefcase,
  BsPlusLg,
  BsArrowClockwise,
  BsCalendarEvent,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getDashboardSummaryApi,
  type DashboardSummary,
} from "../services/dashboardService";
import { getProjectsApi, type Project } from "../services/projectService";

export const DashboardPage: React.FC = () => {
  const { token } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, projectsRes] = await Promise.all([
        getDashboardSummaryApi(token),
        getProjectsApi(token),
      ]);
      setSummary(summaryRes);
      setProjects(projectsRes);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data dashboard dari backend API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Helper status badge class
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

  if (isLoading) {
    return (
      <div className="py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "2.5rem", height: "2.5rem" }}
        >
          <span className="visually-hidden">Memuat data dashboard...</span>
        </div>
        <p className="mt-3 text-muted fs-7">
          Mengambil data terbaru dari backend...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger p-4 rounded-3 d-flex flex-column align-items-start gap-2 shadow-sm">
        <div className="d-flex align-items-center gap-2 fw-semibold fs-6">
          <BsExclamationTriangle size={20} />
          <span>Gagal Memuat Dashboard</span>
        </div>
        <p className="mb-2 fs-7 text-secondary">{error}</p>
        <button
          className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1.5 rounded-3"
          onClick={fetchDashboardData}
        >
          <BsArrowClockwise /> Coba Lagi
        </button>
      </div>
    );
  }

  // Find max task count to normalize workload progress bar
  const maxTaskCount =
    summary?.members_workload && summary.members_workload.length > 0
      ? Math.max(
          ...summary.members_workload.map((m) => m.active_tasks_count),
          5,
        )
      : 5;

  return (
    <div>
      {/* Header Halaman */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Dashboard Ringkasan</h4>
          <p className="text-muted mb-0 fs-7">
            Pantau statistik proyek aktif, tugas overdue, dan beban kerja tim
            secara real-time.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light border d-inline-flex align-items-center gap-2 rounded-3 px-3 fs-7"
            onClick={fetchDashboardData}
            title="Refresh Data"
          >
            <BsArrowClockwise /> Refresh
          </button>
          <Link
            to="/projects"
            className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3"
          >
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
                <span className="text-muted fs-7 fw-semibold">
                  Proyek Aktif
                </span>
                <h3 className="fw-bold text-dark mt-1 mb-0">
                  {summary?.active_projects_count ?? 0}
                </h3>
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
                <span className="text-muted fs-7 fw-semibold">
                  Task Overdue
                </span>
                <h3 className="fw-bold text-danger mt-1 mb-0">
                  {summary?.overdue_tasks_count ?? 0}
                </h3>
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
                <span className="text-muted fs-7 fw-semibold">Anggota Tim</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">
                  {summary?.members_workload.length ?? 0}
                </h3>
              </div>
              <div className="stat-icon-wrapper bg-info-subtle text-info">
                <BsPeople />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fs-7 fw-semibold">
                  Total Proyek
                </span>
                <h3 className="fw-bold text-success mt-1 mb-0">
                  {projects.length}
                </h3>
              </div>
              <div className="stat-icon-wrapper bg-success-subtle text-success">
                <BsBriefcase />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Baris Konten: Proyek & Workload */}
      <div className="row g-4">
        {/* Kolom Kiri: Daftar Proyek */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-bold mb-0 text-dark">Proyek Terdaftar</h6>
              <Link
                to="/projects"
                className="fs-7 text-primary text-decoration-none fw-semibold"
              >
                Lihat Semua ({projects.length})
              </Link>
            </div>
            <div className="card-body p-0">
              {projects.length === 0 ? (
                <div className="p-4 text-center text-muted fs-7">
                  Belum ada proyek terdaftar di sistem.
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
                      </tr>
                    </thead>
                    <tbody className="fs-7">
                      {projects.slice(0, 5).map((project) => (
                        <tr key={project.id}>
                          <td className="fw-semibold text-dark">
                            {project.name}
                          </td>
                          <td>
                            {project.client?.company ||
                              project.client?.name ||
                              "-"}
                          </td>
                          <td>
                            <span className="text-muted">
                              <BsCalendarEvent className="me-1" />{" "}
                              {project.deadline}
                            </span>
                          </td>
                          <td>{getStatusBadge(project.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Workload Anggota Tim */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0 text-dark">
                Beban Kerja Tim (Workload per Member)
              </h6>
            </div>
            <div className="card-body">
              {!summary?.members_workload ||
              summary.members_workload.length === 0 ? (
                <div className="text-center text-muted fs-7 py-3">
                  Belum ada anggota tim (role member) terdaftar.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {summary.members_workload.map((member) => {
                    const percentage = Math.min(
                      Math.round(
                        (member.active_tasks_count / maxTaskCount) * 100,
                      ),
                      100,
                    );
                    let barColor = "bg-primary";
                    if (percentage >= 80) barColor = "bg-danger";
                    else if (percentage >= 50) barColor = "bg-warning";

                    return (
                      <div key={member.id}>
                        <div className="d-flex justify-content-between fs-7 mb-1">
                          <span className="fw-semibold text-dark">
                            {member.name}
                          </span>
                          <span className="text-muted fs-8">
                            {member.active_tasks_count} Task Aktif
                          </span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className={`progress-bar ${barColor}`}
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={member.active_tasks_count}
                            aria-valuemin={0}
                            aria-valuemax={maxTaskCount}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
