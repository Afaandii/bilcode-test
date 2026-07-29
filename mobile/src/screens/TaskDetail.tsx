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
  // useIonRouter,
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
} from "ionicons/icons";
import { Task, TaskStatus, taskService } from "../services/taskService";
import "./TaskDetail.css";

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const taskId = parseInt(id, 10);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  // const router = useIonRouter();

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

  useEffect(() => {
    fetchTaskDetail();
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
            <IonButton fill="clear" color="light" onClick={fetchTaskDetail}>
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
