import React, { useState, useEffect, useCallback } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  IonIcon,
  IonSkeletonText,
  IonToast,
  IonButtons,
  useIonViewWillEnter,
  useIonRouter,
} from "@ionic/react";
import {
  refreshOutline,
  alertCircleOutline,
  listOutline,
  notificationsOutline,
} from "ionicons/icons";
import { Task, taskService } from "../services/taskService";
import { notificationService } from "../services/notificationService";
import { TaskCard } from "../components/TaskCard";
import { useAuth } from "../context/AuthContext";
import "./TaskList.css";

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  const { user } = useAuth();
  const router = useIonRouter();

  const fetchTasks = useCallback(
    async (statusFilter: string = selectedStatus) => {
      setLoading(true);
      setError(null);

      try {
        const response = await taskService.getTasks(statusFilter);

        if (response.status === "success" && response.data) {
          setTasks(response.data);
        } else {
          setError(response.message || "Gagal mengambil daftar task.");
        }
      } catch (err: any) {
        setError(
          err.message || "Terjadi kesalahan saat terhubung ke backend API.",
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedStatus],
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.status === "success" && res.data) {
        setUnreadNotifCount(notificationService.getUnreadCount(res.data));
      }
    } catch {
      // Ignore background notification count error
    }
  }, []);

  useIonViewWillEnter(() => {
    fetchTasks();
    fetchNotifications();
  });

  useEffect(() => {
    fetchTasks(selectedStatus);
    fetchNotifications();
  }, [selectedStatus]);

  const handleRefresh = async (event: CustomEvent) => {
    await Promise.all([fetchTasks(selectedStatus), fetchNotifications()]);
    event.detail.complete();
    setToastMessage("Daftar task dan notifikasi diperbarui");
    setShowToast(true);
  };

  const handleTaskClick = (task: Task) => {
    router.push(`/tasks/detail/${task.id}`);
  };

  // Filter tasks locally by search query
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.project?.name &&
        task.project.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Calculate task counts per status
  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <IonPage id="task-list-page">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <div className="toolbar-header">
              <span>Task Saya</span>
              {user && (
                <span className="user-greeting">
                  Halo, {user.name.split(" ")[0]}
                </span>
              )}
            </div>
          </IonTitle>

          <IonButtons slot="end">
            {/* Notification Bell Button */}
            <IonButton
              fill="clear"
              color="light"
              onClick={() => router.push("/notifications")}
              className="notif-bell-btn"
            >
              <IonIcon icon={notificationsOutline} slot="icon-only" />
              {unreadNotifCount > 0 && (
                <IonBadge color="danger" className="toolbar-notif-badge">
                  {unreadNotifCount}
                </IonBadge>
              )}
            </IonButton>

            {/* Refresh Button */}
            <IonButton
              fill="clear"
              color="light"
              onClick={() => {
                fetchTasks();
                fetchNotifications();
              }}
            >
              <IonIcon icon={refreshOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Filter Segment Tabs */}
        <IonToolbar color="dark" className="segment-toolbar">
          <IonSegment
            value={selectedStatus}
            onIonChange={(e) => setSelectedStatus(e.detail.value as string)}
            scrollable
            mode="md"
          >
            <IonSegmentButton value="all">
              <IonLabel>Semua</IonLabel>
              <IonBadge color="medium">{counts.all}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="todo">
              <IonLabel>To Do</IonLabel>
              <IonBadge color="warning">{counts.todo}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="in_progress">
              <IonLabel>In Progress</IonLabel>
              <IonBadge color="primary">{counts.in_progress}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="review">
              <IonLabel>Review</IonLabel>
              <IonBadge color="tertiary">{counts.review}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="done">
              <IonLabel>Selesai</IonLabel>
              <IonBadge color="success">{counts.done}</IonBadge>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding task-list-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Tarik untuk refresh"
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        {/* Searchbar */}
        <IonSearchbar
          value={searchQuery}
          onIonInput={(e) => setSearchQuery(e.detail.value!)}
          placeholder="Cari task atau nama proyek..."
          className="task-searchbar"
          animated
        />

        {/* Error Banner */}
        {error && (
          <div className="error-container">
            <IonIcon icon={alertCircleOutline} className="error-icon" />
            <p>{error}</p>
            <IonButton
              size="small"
              color="primary"
              onClick={() => fetchTasks()}
            >
              Coba Lagi
            </IonButton>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="skeleton-container">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card">
                <IonSkeletonText
                  animated
                  style={{ width: "40%", height: "16px" }}
                />
                <IonSkeletonText
                  animated
                  style={{ width: "80%", height: "24px", margin: "8px 0" }}
                />
                <IonSkeletonText
                  animated
                  style={{ width: "100%", height: "14px" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Task List Items */}
        {!loading && !error && filteredTasks.length > 0 && (
          <div className="task-cards-list">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <IonIcon icon={listOutline} />
            </div>
            <h3>Tidak Ada Task</h3>
            <p>
              {searchQuery
                ? `Tidak ada task yang cocok dengan kata kunci "${searchQuery}"`
                : selectedStatus !== "all"
                  ? `Belum ada task dengan status ${taskService.getStatusLabel(selectedStatus)}.`
                  : "Belum ada task yang di-assign ke akun Anda."}
            </p>
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default TaskList;
