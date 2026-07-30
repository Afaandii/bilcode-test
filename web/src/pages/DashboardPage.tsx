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

  // Helper status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="badge-status-in_progress">Aktif</span>;
      case "completed":
        return <span className="badge-status-done">Selesai</span>;
      case "on_hold":
        return <span className="badge-status-review">On Hold</span>;
      default:
        return <span className="badge-status-todo">{status}</span>;
    }
  };

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="dash-loading-state">
        <div className="dash-spinner-ring" role="status" aria-label="Memuat data dashboard..." />
        <p className="dash-loading-text">Mengambil data terbaru dari backend...</p>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="dash-error-state">
        <h6 className="dash-error-title">
          <BsExclamationTriangle size={18} />
          Gagal Memuat Dashboard
        </h6>
        <p className="dash-error-message">{error}</p>
        <button className="dash-btn-retry" onClick={fetchDashboardData}>
          <BsArrowClockwise size={14} /> Coba Lagi
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
      {/* ── Page Header ── */}
      <div className="dash-page-header">
        <div className="dash-page-title-row">
          <div className="dash-page-title-group">
            <h1 className="dash-page-title">
              Dashboard Ringkasan
              <span className="dash-realtime-badge">● Real-time</span>
            </h1>
            <p className="dash-page-subtitle">
              Pantau statistik proyek aktif, tugas overdue, dan beban kerja tim
              secara real-time.
            </p>
          </div>
          <div className="dash-page-actions">
            <button
              className="dash-btn-secondary"
              onClick={fetchDashboardData}
              title="Refresh Data"
            >
              <BsArrowClockwise size={14} /> Refresh
            </button>
            <Link to="/projects" className="dash-btn-primary">
              <BsPlusLg size={13} /> Proyek Baru
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dash-stats-grid">
        {/* Proyek Aktif */}
        <div className="stat-card stat-card-blue">
          <div className="stat-card-body">
            <div>
              <div className="stat-label">Proyek Aktif</div>
              <div className="stat-value stat-value-blue">
                {summary?.active_projects_count ?? 0}
              </div>
            </div>
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }}
            >
              <BsFolderCheck />
            </div>
          </div>
        </div>

        {/* Task Overdue */}
        <div className="stat-card stat-card-red">
          <div className="stat-card-body">
            <div>
              <div className="stat-label">Task Overdue</div>
              <div className="stat-value stat-value-red">
                {summary?.overdue_tasks_count ?? 0}
              </div>
            </div>
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
            >
              <BsExclamationTriangle />
            </div>
          </div>
        </div>

        {/* Anggota Tim */}
        <div className="stat-card stat-card-cyan">
          <div className="stat-card-body">
            <div>
              <div className="stat-label">Anggota Tim</div>
              <div className="stat-value stat-value-cyan">
                {summary?.members_workload.length ?? 0}
              </div>
            </div>
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}
            >
              <BsPeople />
            </div>
          </div>
        </div>

        {/* Total Proyek */}
        <div className="stat-card stat-card-green">
          <div className="stat-card-body">
            <div>
              <div className="stat-label">Total Proyek</div>
              <div className="stat-value stat-value-green">
                {projects.length}
              </div>
            </div>
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
            >
              <BsBriefcase />
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Panels ── */}
      <div className="dash-panels-row">
        {/* Kolom Kiri: Daftar Proyek */}
        <div className="dash-content-card">
          <div className="dash-content-card-header">
            <h6 className="dash-content-card-title">Proyek Terdaftar</h6>
            <Link to="/projects" className="dash-content-card-link">
              Lihat Semua ({projects.length})
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="dash-empty-state">
              Belum ada proyek terdaftar di sistem.
            </div>
          ) : (
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Nama Proyek</th>
                    <th>Klien</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map((project) => (
                    <tr key={project.id}>
                      <td className="dash-table-name">{project.name}</td>
                      <td>
                        {project.client?.company ||
                          project.client?.name ||
                          "—"}
                      </td>
                      <td>
                        <span className="dash-table-date">
                          <BsCalendarEvent size={12} />
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

        {/* Kolom Kanan: Workload Anggota Tim */}
        <div className="dash-content-card">
          <div className="dash-content-card-header">
            <h6 className="dash-content-card-title">
              Beban Kerja Tim
            </h6>
          </div>

          {!summary?.members_workload ||
          summary.members_workload.length === 0 ? (
            <div className="dash-empty-state">
              Belum ada anggota tim (role member) terdaftar.
            </div>
          ) : (
            <div className="dash-workload-body">
              {summary.members_workload.map((member) => {
                const percentage = Math.min(
                  Math.round(
                    (member.active_tasks_count / maxTaskCount) * 100,
                  ),
                  100,
                );

                let fillClass = "dash-progress-blue";
                if (percentage >= 80) fillClass = "dash-progress-danger";
                else if (percentage >= 50) fillClass = "dash-progress-warning";

                return (
                  <div key={member.id} className="dash-workload-item">
                    <div className="dash-workload-member">
                      <div className="dash-workload-avatar">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="dash-workload-member-info">
                        <span className="dash-workload-name">
                          {member.name}
                        </span>
                        <span className="dash-workload-count">
                          {member.active_tasks_count} Task Aktif
                        </span>
                      </div>
                    </div>
                    <div className="dash-progress-track">
                      <div
                        className={`dash-progress-fill ${fillClass}`}
                        role="progressbar"
                        style={{ width: `${percentage}%` }}
                        aria-valuenow={member.active_tasks_count}
                        aria-valuemin={0}
                        aria-valuemax={maxTaskCount}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
