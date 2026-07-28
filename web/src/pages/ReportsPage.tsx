import React, { useState, useEffect } from "react";
import {
  BsClockHistory,
  BsPrinter,
  BsFilter,
  BsArrowClockwise,
  BsPerson,
  BsFolderCheck,
  BsExclamationTriangle,
  BsFileEarmarkSpreadsheet,
} from "react-icons/bs";
import { useAuth } from "../hooks/useAuth";
import { getTimeLogsApi } from "../services/reportService";
import { type TimeLogItem } from "../services/taskService";
import { getProjectsApi, type Project } from "../services/projectService";
import {
  getDashboardSummaryApi,
  type MemberWorkload,
} from "../services/dashboardService";

export const ReportsPage: React.FC = () => {
  const { token } = useAuth();

  const [timeLogs, setTimeLogs] = useState<TimeLogItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<MemberWorkload[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const fetchReportsData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const [logsData, projectsData, dashboardData] = await Promise.all([
        getTimeLogsApi(token, {
          project_id: selectedProjectId,
          user_id: selectedUserId,
        }),
        getProjectsApi(token),
        getDashboardSummaryApi(token),
      ]);

      setTimeLogs(logsData);
      setProjects(projectsData);
      setMembers(dashboardData.members_workload);
    } catch (err: any) {
      setError(err.message || "Gagal memuat laporan jam kerja.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [token, selectedProjectId, selectedUserId]);

  // Export CSV Functionality
  const handleExportCSV = () => {
    if (timeLogs.length === 0) return;

    const headers = [
      "ID",
      "Tanggal",
      "Anggota Tim",
      "Email",
      "Proyek",
      "Task",
      "Catatan Progres",
      "Jam Kerja (HH:MM:SS)",
    ];
    const rows = timeLogs.map((log) => [
      log.id,
      log.created_at
        ? new Date(log.created_at).toLocaleDateString("id-ID")
        : "-",
      `"${log.user?.name || "-"}"`,
      `"${log.user?.email || "-"}"`,
      `"${(log as any).task?.project?.name || "-"}"`,
      `"${(log as any).task?.title || "-"}"`,
      `"${log.description.replace(/"/g, '""')}"`,
      `"${log.hours}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan_jam_kerja_projectpulse_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF / Print Functionality
  const handleExportPDF = () => {
    window.print();
  };

  // Calculate Total Hours Helper
  const calculateTotalHours = () => {
    let totalMinutes = 0;
    timeLogs.forEach((log) => {
      if (log.hours) {
        const parts = log.hours.split(":");
        const hrs = parseInt(parts[0] || "0", 10);
        const mins = parseInt(parts[1] || "0", 10);
        totalMinutes += hrs * 60 + mins;
      }
    });
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h} Jam ${m} Menit`;
  };

  return (
    <div>
      {/* Header Halaman (Sembunyi saat cetak PDF) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 d-print-none">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            Laporan Jam Kerja per Proyek & Anggota
          </h4>
          <p className="text-muted mb-0 fs-7">
            Rekapitulasi log waktu kerja tim dan ekspor laporan ke format CSV /
            PDF.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 rounded-3 px-3 fs-7"
            onClick={handleExportCSV}
            disabled={timeLogs.length === 0}
            title="Download Spreadsheet CSV"
          >
            <BsFileEarmarkSpreadsheet className="text-success" /> Ekspor CSV
          </button>
          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 px-3"
            onClick={handleExportPDF}
            disabled={timeLogs.length === 0}
            title="Cetak Laporan / Simpan PDF"
          >
            <BsPrinter /> Cetak Laporan (PDF)
          </button>
        </div>
      </div>

      {/* Header Khusus Tampilan PDF Print */}
      <div className="d-none d-print-block mb-4">
        <h3 className="fw-bold text-dark mb-1">
          ProjectPulse &bull; Laporan Rekapitulasi Jam Kerja
        </h3>
        <p className="text-muted fs-7 mb-3">
          Dicetak pada: {new Date().toLocaleDateString("id-ID")} oleh Admin
        </p>
        <hr />
      </div>

      {/* Stat Cards Ringkasan */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fs-7 fw-semibold">
                  Total Log Terdaftar
                </span>
                <h3 className="fw-bold text-dark mt-1 mb-0">
                  {timeLogs.length} Entri
                </h3>
              </div>
              <div className="stat-icon-wrapper bg-primary-subtle text-primary">
                <BsClockHistory />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fs-7 fw-semibold">
                  Akumulasi Jam Kerja
                </span>
                <h3 className="fw-bold text-success mt-1 mb-0">
                  {calculateTotalHours()}
                </h3>
              </div>
              <div className="stat-icon-wrapper bg-success-subtle text-success">
                <BsClockHistory />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card stat-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fs-7 fw-semibold">
                  Jumlah Anggota Aktif
                </span>
                <h3 className="fw-bold text-dark mt-1 mb-0">
                  {members.length} Member
                </h3>
              </div>
              <div className="stat-icon-wrapper bg-info-subtle text-info">
                <BsPerson />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar (Sembunyi saat cetak PDF) */}
      <div className="card border-0 shadow-sm mb-4 d-print-none">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center gap-2 text-secondary fw-semibold fs-7 me-2">
              <BsFilter size={18} /> Filter Laporan:
            </div>

            {/* Filter Proyek */}
            <div className="col-12 col-sm-6 col-md-4">
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

            {/* Filter Anggota Tim */}
            <div className="col-12 col-sm-6 col-md-4">
              <select
                className="form-select form-select-sm rounded-3"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Semua Anggota Tim ({members.length})</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-auto ms-auto">
              <button
                className="btn btn-light btn-sm border d-inline-flex align-items-center gap-1.5"
                onClick={fetchReportsData}
              >
                <BsArrowClockwise /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Error */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 rounded-3 mb-4 fs-7"
          role="alert"
        >
          <BsExclamationTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Tabel Laporan Jam Kerja */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            Rincian Log Waktu Kerja Tim
          </h6>
          <span className="text-muted fs-7">
            Menampilkan {timeLogs.length} Baris Data
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
                <span className="visually-hidden">Memuat laporan...</span>
              </div>
              <p className="mt-2 text-muted fs-7 mb-0">
                Mengambil data log waktu kerja...
              </p>
            </div>
          ) : timeLogs.length === 0 ? (
            <div className="p-5 text-center text-muted fs-7">
              Belum ada data log waktu kerja yang sesuai dengan filter.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 fs-7">
                <thead className="table-light text-secondary">
                  <tr>
                    <th>Tanggal</th>
                    <th>Anggota Tim</th>
                    <th>Proyek & Task</th>
                    <th>Catatan Progres / Log Pekerjaan</th>
                    <th className="text-end">Durasi (Jam)</th>
                  </tr>
                </thead>
                <tbody>
                  {timeLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-muted">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="fw-semibold text-dark">
                        <div className="d-flex align-items-center gap-1.5">
                          <BsPerson className="text-primary" />{" "}
                          {log.user?.name || "Anggota"}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold text-dark">
                            {(log as any).task?.project?.name ||
                              `Proyek Task #${log.task_id}`}
                          </div>
                          <small className="text-muted fs-8 d-flex align-items-center gap-1">
                            <BsFolderCheck />{" "}
                            {(log as any).task?.title || `Task #${log.task_id}`}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="text-secondary">
                          {log.description}
                        </span>
                      </td>
                      <td className="text-end">
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 fw-semibold fs-7">
                          {log.hours} Jam
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
