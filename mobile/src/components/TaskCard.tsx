import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
} from "@ionic/react";
import {
  calendarOutline,
  timeOutline,
  codeSlashOutline,
  colorPaletteOutline,
  serverOutline,
  checkmarkDoneCircleOutline,
  folderOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import { Task, taskService } from "../services/taskService";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "frontend":
        return codeSlashOutline;
      case "backend":
        return serverOutline;
      case "design":
        return colorPaletteOutline;
      case "qa":
        return checkmarkDoneCircleOutline;
      default:
        return codeSlashOutline;
    }
  };

  const isOverdue = () => {
    if (!task.deadline || task.status === "done") return false;
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  const getStatusClass = () => {
    switch (task.status) {
      case "todo":        return "status-todo";
      case "in_progress": return "status-in-progress";
      case "review":      return "status-review";
      case "done":        return "status-done";
      default:            return "";
    }
  };

  return (
    <IonCard
      className={`task-card ${getStatusClass()} ${isOverdue() ? "overdue-card" : ""}`}
      onClick={() => onClick && onClick(task)}
    >
      <IonCardHeader>
        <div className="task-header-meta">
          <IonBadge
            color={taskService.getStatusBadgeColor(task.status)}
            className="status-badge"
          >
            {taskService.getStatusLabel(task.status)}
          </IonBadge>

          <IonBadge color="medium" className="category-badge">
            <IonIcon
              icon={getCategoryIcon(task.category)}
              style={{ marginRight: "4px" }}
            />
            {task.category?.toUpperCase() || "GENERAL"}
          </IonBadge>
        </div>

        <IonCardTitle className="task-title">{task.title}</IonCardTitle>

        {task.project && (
          <IonCardSubtitle className="project-name">
            <IonIcon icon={folderOutline} style={{ marginRight: "4px" }} />
            {task.project.name}
          </IonCardSubtitle>
        )}
      </IonCardHeader>

      <IonCardContent>
        <p className="task-description">{task.description}</p>

        <div className="task-footer">
          <div className="footer-item">
            <IonIcon
              icon={calendarOutline}
              className={isOverdue() ? "overdue-icon" : ""}
            />
            <span className={isOverdue() ? "overdue-text" : ""}>
              {task.deadline || "No deadline"}
              {isOverdue() && " (Overdue)"}
            </span>
          </div>

          {task.estimated_effort && (
            <div className="footer-item">
              <IonIcon icon={timeOutline} />
              <span>{task.estimated_effort}</span>
            </div>
          )}

          <div className="footer-arrow">
            <IonIcon icon={chevronForwardOutline} />
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
