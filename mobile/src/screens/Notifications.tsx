import React, { useState, useEffect, useCallback } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonToast,
  useIonViewWillEnter,
  useIonRouter,
} from "@ionic/react";
import {
  notificationsOutline,
  checkmarkDoneOutline,
  refreshOutline,
  alertCircleOutline,
  briefcaseOutline,
  timeOutline,
  chevronForwardOutline,
  mailUnreadOutline,
} from "ionicons/icons";
import {
  AppNotification,
  notificationService,
} from "../services/notificationService";
import "./Notifications.css";

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  const router = useIonRouter();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotifications();

      if (response.status === "success" && response.data) {
        setNotifications(response.data);
      } else {
        setError(response.message || "Gagal mengambil daftar notifikasi.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    fetchNotifications();
  });

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchNotifications();
    event.detail.complete();
    setToastMessage("Notifikasi berhasil diperbarui");
    setShowToast(true);
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    // Mark as read if not read yet
    if (!notif.read_at) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        );
      } catch {
        // Ignore mark as read error
      }
    }

    // Navigate to related task detail if task_id exists
    if (notif.task_id) {
      router.push(`/tasks/detail/${notif.task_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.status === "success") {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
        );
        setToastMessage("Semua notifikasi ditandai telah dibaca.");
        setShowToast(true);
      }
    } catch (err: any) {
      setToastMessage(err.message || "Gagal memperbarui status notifikasi.");
      setShowToast(true);
    }
  };

  const unreadCount = notificationService.getUnreadCount(notifications);

  const formatNotificationTime = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline_approaching":
        return timeOutline;
      case "new_task":
        return briefcaseOutline;
      default:
        return notificationsOutline;
    }
  };

  return (
    <IonPage id="notifications-page">
      <IonHeader>
        <IonToolbar className="notif-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" text="Kembali" />
          </IonButtons>
          <IonTitle>
            <div className="notif-header-title">
              <span className="notif-header-text">Notifikasi In-App</span>
              {unreadCount > 0 && (
                <IonBadge color="danger" className="unread-badge">
                  {unreadCount} Baru
                </IonBadge>
              )}
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" className="notif-refresh-btn" onClick={fetchNotifications}>
              <IonIcon icon={refreshOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Toolbar Action for Mark All Read */}
        {unreadCount > 0 && (
          <IonToolbar className="action-toolbar">
            <IonButton
              fill="clear"
              size="small"
              className="mark-all-btn"
              onClick={handleMarkAllRead}
            >
              <IonIcon icon={checkmarkDoneOutline} slot="start" />
              Tandai Semua Telah Dibaca
            </IonButton>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent className="notifications-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Tarik untuk refresh"
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        {/* Error Banner */}
        {error && (
          <div className="error-container">
            <IonIcon icon={alertCircleOutline} className="error-icon" />
            <p>{error}</p>
            <IonButton
              size="small"
              color="primary"
              onClick={fetchNotifications}
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
                  style={{ width: "90%", height: "20px", margin: "6px 0" }}
                />
                <IonSkeletonText
                  animated
                  style={{ width: "60%", height: "14px" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && notifications.length > 0 && (
          <div className="notifications-list">
            {notifications.map((notif) => {
              const isUnread = !notif.read_at;
              return (
                <div
                  key={notif.id}
                  className={`notif-card ${isUnread ? "unread" : "read"}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-icon-wrapper">
                    <IonIcon
                      icon={getNotificationIcon(notif.type)}
                      className={
                        notif.type === "deadline_approaching"
                          ? "deadline-icon"
                          : "task-icon"
                      }
                    />
                  </div>

                  <div className="notif-body">
                    <div className="notif-top">
                      <h4 className="notif-title">{notif.title}</h4>
                      {isUnread && <span className="unread-dot" />}
                    </div>
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">
                      {formatNotificationTime(notif.created_at)}
                    </span>
                  </div>

                  <div className="notif-arrow">
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && notifications.length === 0 && (
          <div className="empty-notif-state">
            <div className="empty-notif-box">
              <IonIcon icon={mailUnreadOutline} />
            </div>
            <h3>Tidak Ada Notifikasi</h3>
            <p>
              Belum ada notifikasi task baru atau pengingat deadline untuk akun
              Anda.
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

export default Notifications;
