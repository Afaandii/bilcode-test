import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonButton,
  IonIcon,
  IonSkeletonText,
  IonToast,
  IonBadge,
  IonSearchbar,
  useIonViewWillEnter,
  useIonRouter,
} from '@ionic/react';
import {
  checkmarkDoneCircleOutline,
  refreshOutline,
  alertCircleOutline,
  ribbonOutline,
  calendarOutline,
  timeOutline,
  folderOutline,
  chevronForwardOutline,
  codeSlashOutline,
} from 'ionicons/icons';
import { Task, taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import './CompletedTasks.css';

export const CompletedTasks: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const { user } = useAuth();
  const router = useIonRouter();

  const fetchCompletedTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.getTasks('done');

      if (response.status === 'success' && response.data) {
        setCompletedTasks(response.data);
      } else {
        setError(response.message || 'Gagal mengambil riwayat task selesai.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    fetchCompletedTasks();
  });

  useEffect(() => {
    fetchCompletedTasks();
  }, [fetchCompletedTasks]);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchCompletedTasks();
    event.detail.complete();
    setToastMessage('Riwayat task selesai berhasil diperbarui');
    setShowToast(true);
  };

  const handleTaskClick = (taskId: number) => {
    router.push(`/tasks/detail/${taskId}`);
  };

  const filteredTasks = completedTasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      (task.project?.name && task.project.name.toLowerCase().includes(query))
    );
  });

  return (
    <IonPage id="completed-tasks-page">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <div className="completed-header">
              <span>Riwayat Task Selesai</span>
              <IonBadge color="success" className="count-badge">
                {completedTasks.length} Selesai
              </IonBadge>
            </div>
          </IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={fetchCompletedTasks}>
            <IonIcon icon={refreshOutline} slot="icon-only" />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding completed-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk refresh" refreshingSpinner="crescent" />
        </IonRefresher>

        {/* Hero Summary Card */}
        <div className="summary-banner">
          <div className="banner-icon">
            <IonIcon icon={ribbonOutline} />
          </div>
          <div className="banner-info">
            <h3>Pencapaian Member</h3>
            <p>
              {user ? user.name : 'Member'} telah menyelesaikan{' '}
              <strong>{completedTasks.length} task</strong> sejauh ini.
            </p>
          </div>
        </div>

        {/* Searchbar */}
        <IonSearchbar
          value={searchQuery}
          onIonInput={(e) => setSearchQuery(e.detail.value!)}
          placeholder="Cari riwayat task selesai..."
          className="completed-searchbar"
          animated
        />

        {/* Error Banner */}
        {error && (
          <div className="error-container">
            <IonIcon icon={alertCircleOutline} className="error-icon" />
            <p>{error}</p>
            <IonButton size="small" color="primary" onClick={fetchCompletedTasks}>
              Coba Lagi
            </IonButton>
          </div>
        )}

        {/* Skeleton Loader */}
        {loading && !error && (
          <div className="skeleton-container">
            {[1, 2].map((n) => (
              <div key={n} className="skeleton-card">
                <IonSkeletonText animated style={{ width: '35%', height: '16px' }} />
                <IonSkeletonText animated style={{ width: '80%', height: '24px', margin: '8px 0' }} />
                <IonSkeletonText animated style={{ width: '100%', height: '14px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Completed Task Cards */}
        {!loading && !error && filteredTasks.length > 0 && (
          <div className="completed-cards-list">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="completed-task-card"
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="card-top-row">
                  <IonBadge color="success" className="done-badge">
                    <IonIcon icon={checkmarkDoneCircleOutline} style={{ marginRight: '4px' }} />
                    SELESAI
                  </IonBadge>
                  <IonBadge color="medium" className="cat-badge">
                    {task.category?.toUpperCase() || 'GENERAL'}
                  </IonBadge>
                </div>

                <h4 className="card-title">{task.title}</h4>

                {task.project && (
                  <div className="card-project">
                    <IonIcon icon={folderOutline} />
                    <span>{task.project.name}</span>
                  </div>
                )}

                <p className="card-description">{task.description}</p>

                <div className="card-footer-row">
                  <div className="footer-meta">
                    <IonIcon icon={calendarOutline} />
                    <span>Deadline: {task.deadline || '-'}</span>
                  </div>
                  {task.estimated_effort && (
                    <div className="footer-meta">
                      <IonIcon icon={timeOutline} />
                      <span>Effort: {task.estimated_effort}</span>
                    </div>
                  )}
                  <IonIcon icon={chevronForwardOutline} className="arrow-icon" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTasks.length === 0 && (
          <div className="empty-completed-state">
            <div className="empty-icon-box">
              <IonIcon icon={checkmarkDoneCircleOutline} />
            </div>
            <h3>Belum Ada Task Selesai</h3>
            <p>
              {searchQuery
                ? `Tidak ada task selesai yang cocok dengan pencarian "${searchQuery}"`
                : 'Belum ada task yang telah diselesaikan. Selesaikan task di tab "Task Saya".'}
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

export default CompletedTasks;
