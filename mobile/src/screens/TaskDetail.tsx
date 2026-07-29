import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from "@ionic/react";
import { useParams } from "react-router-dom";
import {
  calendarOutline,
  timeOutline,
  personOutline,
  folderOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  playCircleOutline,
  eyeOutline,
  refreshOutline,
  addCircleOutline,
  timeOutline as timeLogIcon,
  documentTextOutline,
} from "ionicons/icons";
import {
  Task,
  TaskStatus,
  TimeLog,
  taskService,
} from "../services/taskService";
import TimeLogModal from "../components/TimeLogModal";
import "./TaskDetail.css";

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const taskId = parseInt(id, 10);

  const [task, setTask] = useState<Task | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchTaskDetail = async () => {
    if (isNaN(taskId)) return;
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.getTaskById(taskId);
      if (response.status === "success" && response.data) {
        setTask(response.data);
      } else {
        setError(response.message || "Task tidak ditemukan.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengambil detail task.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeLogs = async () => {
    if (isNaN(taskId)) return;
    setLoadingLogs(true);
    try {
      const response = await taskService.getTimeLogs(taskId);
      if (response.status === "success" && response.data) {
        setTimeLogs(response.data);
      }
    } catch {
      // Ignore background log fetch error
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchTaskDetail();
    fetchTimeLogs();
  }, [taskId]);

  const handleUpdateStatus = async (newStatus: TaskStatus) => {
    if (!task || task.status === newStatus) return;
    setUpdating(true);

    try {
      const response = await taskService.updateTaskStatus(task.id, newStatus);
      if (response.status === "success" && response.data) {
        setTask(response.data);
        setToastMessage(
          `Status berhasil diperbarui ke "${taskService.getStatusLabel(newStatus)}"`,
        );
        setShowToast(true);
      } else {
        setToastMessage(response.message || "Gagal memperbarui status task.");
        setShowToast(true);
      }
    } catch (err: any) {
      setToastMessage(
        err.message || "Terjadi kesalahan saat mengupdate status.",
      );
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleTimeLogAdded = (newLog: TimeLog) => {
    setTimeLogs((prev) => [newLog, ...prev]);
    setToastMessage("Catatan progres & log waktu berhasil ditambahkan!");
    setShowToast(true);
  };

  const getNextStatusAction = () => {
    if (!task) return null;
    switch (task.status) {
      case "todo":
        return {
          status: "in_progress",
          label: "Mulai Pengerjaan (In Progress)",
          icon: playCircleOutline,
          color: "primary",
        };
      case "in_progress":
        return {
          status: "review",
          label: "Kirim ke Review (Review)",
          icon: eyeOutline,
          color: "tertiary",
        };
      case "review":
        return {
          status: "done",
          label: "Tandai Selesai (Done)",
          icon: checkmarkCircleOutline,
          color: "success",
        };
      case "done":
        return {
          status: "todo",
          label: "Buka Kembali (To Do)",
          icon: refreshOutline,
          color: "warning",
        };
      default:
        return null;
    }
  };

  const isOverdue = () => {
    if (!task || !task.deadline || task.status === "done") return false;
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  const calculateTotalLoggedTime = (): string => {
    let totalMinutes = 0;
    timeLogs.forEach((log) => {
      if (log.hours) {
        const parts = log.hours.split(":");
        const h = parseInt(parts[0] || "0", 10);
        const m = parseInt(parts[1] || "0", 10);
        totalMinutes += h * 60 + m;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours} jam ${mins} menit`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const stages: { key: TaskStatus; label: string }[] = [
    { key: "todo", label: "To Do" },
    { key: "in_progress", label: "In Progress" },
    { key: "review", label: "Review" },
    { key: "done", label: "Selesai" },
  ];

  const getStageIndex = (status: TaskStatus) => {
    return stages.findIndex((s) => s.key === status);
  };

  const nextAction = getNextStatusAction();

  return (
    <IonPage id="task-detail-page">
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" text="Kembali" />
          </IonButtons>
          <IonTitle>Detail Task</IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              color="light"
              onClick={() => {
                fetchTaskDetail();
                fetchTimeLogs();
              }}
            >
              <IonIcon icon={refreshOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding task-detail-content">
        {loading && (
          <div className="detail-loading">
            <IonSpinner name="crescent" color="primary" />
            <p>Memuat detail task...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <IonIcon icon={alertCircleOutline} className="error-icon" />
            <p>{error}</p>
            <IonButton size="small" color="primary" onClick={fetchTaskDetail}>
              Coba Lagi
            </IonButton>
          </div>
        )}

        {!loading && !error && task && (
          <div className="detail-wrapper">
            {/* Status Stepper Progress */}
            <div className="stepper-card">
              <div className="stepper-title">Progres Task:</div>
              <div className="stepper-container">
                {stages.map((stage, idx) => {
                  const currentIndex = getStageIndex(task.status);
                  const isCurrent = task.status === stage.key;
                  const isPassed = idx < currentIndex;

                  return (
                    <div
                      key={stage.key}
                      className={`step-item ${isCurrent ? "active" : ""} ${isPassed ? "passed" : ""}`}
                    >
                      <div className="step-circle">
                        {isPassed ? (
                          <IonIcon icon={checkmarkCircleOutline} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className="step-label">{stage.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Card Header */}
            <IonCard className="detail-card">
              <IonCardHeader>
                <div className="detail-badges">
                  <IonBadge
                    color={taskService.getStatusBadgeColor(task.status)}
                    className="status-badge-lg"
                  >
                    {taskService.getStatusLabel(task.status)}
                  </IonBadge>
                  <IonBadge color="medium" className="category-badge-lg">
                    {task.category?.toUpperCase() || "GENERAL"}
                  </IonBadge>
                </div>

                <IonCardTitle className="detail-task-title">
                  {task.title}
                </IonCardTitle>

                {task.project && (
                  <IonCardSubtitle className="detail-project-name">
                    <IonIcon
                      icon={folderOutline}
                      style={{ marginRight: "6px" }}
                    />
                    {task.project.name}
                  </IonCardSubtitle>
                )}
              </IonCardHeader>

              <IonCardContent>
                {/* Meta info grid */}
                <div className="meta-grid">
                  <div
                    className={`meta-item ${isOverdue() ? "overdue-box" : ""}`}
                  >
                    <IonIcon
                      icon={calendarOutline}
                      className={isOverdue() ? "overdue-icon" : "meta-icon"}
                    />
                    <div>
                      <span className="meta-label">Deadline</span>
                      <strong className={isOverdue() ? "overdue-text" : ""}>
                        {task.deadline || "-"} {isOverdue() && "(Overdue)"}
                      </strong>
                    </div>
                  </div>

                  <div className="meta-item">
                    <IonIcon icon={timeOutline} className="meta-icon" />
                    <div>
                      <span className="meta-label">Estimasi Effort</span>
                      <strong>{task.estimated_effort || "-"}</strong>
                    </div>
                  </div>

                  {task.assignee && (
                    <div className="meta-item full-width">
                      <IonIcon icon={personOutline} className="meta-icon" />
                      <div>
                        <span className="meta-label">
                          Assignee (Penanggung Jawab)
                        </span>
                        <strong>
                          {task.assignee.name} ({task.assignee.email})
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="description-section">
                  <h4>Deskripsi Task:</h4>
                  <p>{task.description}</p>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Status Update Action Card */}
            <IonCard className="action-card">
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: "1.1rem" }}>
                  Ubah Status Task
                </IonCardTitle>
                <IonCardSubtitle>
                  Pilih status baru untuk memperbarui progres task ini
                </IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent>
                {/* Quick Next Stage Action Button */}
                {nextAction && (
                  <IonButton
                    expand="block"
                    color={nextAction.color}
                    disabled={updating}
                    onClick={() => handleUpdateStatus(nextAction.status)}
                    className="next-action-button"
                  >
                    {updating ? (
                      <IonSpinner
                        name="crescent"
                        style={{ marginRight: "8px" }}
                      />
                    ) : (
                      <IonIcon icon={nextAction.icon} slot="start" />
                    )}
                    {nextAction.label}
                  </IonButton>
                )}

                <div className="manual-status-label">
                  Atau ubah langsung ke status tertentu:
                </div>

                {/* Direct Segment Selector */}
                <IonSegment
                  value={task.status}
                  onIonChange={(e) =>
                    handleUpdateStatus(e.detail.value as TaskStatus)
                  }
                  disabled={updating}
                  mode="ios"
                  className="status-segment"
                >
                  <IonSegmentButton value="todo">
                    <IonLabel>To Do</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="in_progress">
                    <IonLabel>In Progress</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="review">
                    <IonLabel>Review</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="done">
                    <IonLabel>Selesai</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </IonCardContent>
            </IonCard>

            {/* Time Logging & Progress Notes Card */}
            <IonCard className="timelog-card">
              <IonCardHeader>
                <div className="timelog-header-row">
                  <div>
                    <IonCardTitle style={{ fontSize: "1.1rem" }}>
                      <IonIcon
                        icon={timeLogIcon}
                        color="secondary"
                        style={{ marginRight: "8px" }}
                      />
                      Log Waktu & Catatan Progres
                    </IonCardTitle>
                    <IonCardSubtitle>
                      Total Terakumulasi:{" "}
                      <strong>{calculateTotalLoggedTime()}</strong>
                    </IonCardSubtitle>
                  </div>
                  <IonButton
                    color="secondary"
                    size="small"
                    shape="round"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <IonIcon icon={addCircleOutline} slot="start" />
                    Tambah Log
                  </IonButton>
                </div>
              </IonCardHeader>

              <IonCardContent>
                {loadingLogs && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      color: "#94a3b8",
                    }}
                  >
                    <IonSpinner name="crescent" color="secondary" />
                    <p style={{ fontSize: "0.85rem" }}>
                      Memuat riwayat log waktu...
                    </p>
                  </div>
                )}

                {!loadingLogs && timeLogs.length === 0 && (
                  <div className="empty-timelog">
                    <IonIcon
                      icon={documentTextOutline}
                      className="empty-log-icon"
                    />
                    <p>
                      Belum ada catatan progres atau log waktu untuk task ini.
                    </p>
                    <IonButton
                      fill="outline"
                      size="small"
                      color="secondary"
                      onClick={() => setIsModalOpen(true)}
                    >
                      + Tambah Log Pertama
                    </IonButton>
                  </div>
                )}

                {!loadingLogs && timeLogs.length > 0 && (
                  <div className="timelog-list">
                    {timeLogs.map((log) => (
                      <div key={log.id} className="timelog-item">
                        <div className="timelog-top">
                          <span className="log-author">
                            <IonIcon
                              icon={personOutline}
                              style={{ marginRight: "4px" }}
                            />
                            {log.user?.name || "Member"}
                          </span>
                          <IonBadge color="primary" className="log-hours-badge">
                            ⏱️ {log.hours} jam
                          </IonBadge>
                        </div>
                        <p className="log-desc">{log.description}</p>
                        <span className="log-date">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </IonCardContent>
            </IonCard>

            {/* Time Log Modal */}
            <TimeLogModal
              isOpen={isModalOpen}
              taskId={task.id}
              taskTitle={task.title}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleTimeLogAdded}
            />
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default TaskDetail;
