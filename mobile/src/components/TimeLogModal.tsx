import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonIcon,
  IonSpinner,
  IonBadge,
} from "@ionic/react";
import {
  closeOutline,
  timeOutline,
  documentTextOutline,
  addCircleOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { taskService, TimeLog } from "../services/taskService";
import "./TimeLogModal.css";

interface TimeLogModalProps {
  isOpen: boolean;
  taskId: number;
  taskTitle: string;
  onClose: () => void;
  onSuccess: (newLog: TimeLog) => void;
}

export const TimeLogModal: React.FC<TimeLogModalProps> = ({
  isOpen,
  taskId,
  taskTitle,
  onClose,
  onSuccess,
}) => {
  const [description, setDescription] = useState("");
  const [hoursNum, setHoursNum] = useState<number>(1);
  const [minutesNum, setMinutesNum] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setDescription("");
    setHoursNum(1);
    setMinutesNum(0);
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatHoursString = (h: number, m: number): string => {
    const formattedH = String(Math.max(0, Math.min(23, h))).padStart(2, "0");
    const formattedM = String(Math.max(0, Math.min(59, m))).padStart(2, "0");
    return `${formattedH}:${formattedM}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!description.trim()) {
      setErrorMsg("Silakan isi catatan progres pengerjaan task.");
      return;
    }

    if (hoursNum === 0 && minutesNum === 0) {
      setErrorMsg("Durasi waktu kerja minimal 1 menit.");
      return;
    }

    const formattedHours = formatHoursString(hoursNum, minutesNum);

    setLoading(true);

    try {
      const response = await taskService.addTimeLog(
        taskId,
        description.trim(),
        formattedHours,
      );

      if (response.status === "success" && response.data) {
        onSuccess(response.data);
        handleClose();
      } else {
        setErrorMsg(response.message || "Gagal menambahkan log waktu kerja.");
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || "Terjadi kesalahan sistem saat menyimpan log waktu.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDuration = (h: number, m: number) => {
    setHoursNum(h);
    setMinutesNum(m);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleClose}
      className="time-log-modal"
    >
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Catat Log Waktu & Progres</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" color="light" onClick={handleClose}>
              <IonIcon icon={closeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding modal-content">
        <div className="task-summary-banner">
          <IonBadge color="tertiary">Task ID: #{taskId}</IonBadge>
          <h3 className="modal-task-title">{taskTitle}</h3>
        </div>

        {errorMsg && (
          <div className="error-banner">
            <IonIcon icon={alertCircleOutline} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <IonItem lines="full" className="modal-input-item">
            <IonIcon
              icon={documentTextOutline}
              slot="start"
              className="modal-input-icon"
            />
            <IonLabel position="stacked">
              Catatan Progres / Aktivitas Pengerjaan *
            </IonLabel>
            <IonTextarea
              value={description}
              onIonInput={(e) => setDescription(e.detail.value!)}
              rows={3}
              placeholder="Contoh: Menyelesaikan integrasi API endpoint dan unit test..."
              required
            />
          </IonItem>

          <div className="duration-picker-container">
            <IonLabel className="duration-label">
              <IonIcon icon={timeOutline} style={{ marginRight: "6px" }} />
              Durasi Waktu Kerja:
            </IonLabel>

            <div className="duration-inputs">
              <div className="duration-field">
                <IonInput
                  type="number"
                  min="0"
                  max="23"
                  value={hoursNum}
                  onIonInput={(e) =>
                    setHoursNum(parseInt(e.detail.value! || "0", 10))
                  }
                />
                <span>Jam</span>
              </div>
              <span className="duration-separator">:</span>
              <div className="duration-field">
                <IonInput
                  type="number"
                  min="0"
                  max="59"
                  value={minutesNum}
                  onIonInput={(e) =>
                    setMinutesNum(parseInt(e.detail.value! || "0", 10))
                  }
                />
                <span>Menit</span>
              </div>
            </div>

            <div className="formatted-preview">
              Format API Log:{" "}
              <strong>{formatHoursString(hoursNum, minutesNum)}</strong>
            </div>

            {/* Quick preset buttons */}
            <div className="quick-presets">
              <span className="preset-title">Preset Cepat:</span>
              <div className="preset-buttons">
                <IonButton
                  fill="outline"
                  size="small"
                  type="button"
                  onClick={() => handleQuickDuration(0, 30)}
                >
                  30 mnt
                </IonButton>
                <IonButton
                  fill="outline"
                  size="small"
                  type="button"
                  onClick={() => handleQuickDuration(1, 0)}
                >
                  1 jam
                </IonButton>
                <IonButton
                  fill="outline"
                  size="small"
                  type="button"
                  onClick={() => handleQuickDuration(2, 30)}
                >
                  2.5 jam
                </IonButton>
                <IonButton
                  fill="outline"
                  size="small"
                  type="button"
                  onClick={() => handleQuickDuration(4, 0)}
                >
                  4 jam
                </IonButton>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <IonButton
              expand="block"
              type="submit"
              disabled={loading}
              shape="round"
              color="success"
            >
              {loading ? (
                <>
                  <IonSpinner name="crescent" style={{ marginRight: "8px" }} />
                  Menyimpan...
                </>
              ) : (
                <>
                  <IonIcon icon={addCircleOutline} slot="start" />
                  Simpan Catatan & Log Waktu
                </>
              )}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonModal>
  );
};

export default TimeLogModal;
