import { apiFetch, ApiResponse } from './api';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | string;
export type TaskCategory = 'frontend' | 'backend' | 'design' | 'QA' | string;

export interface ProjectInfo {
  id: number;
  name: string;
  deadline?: string;
  status?: string;
}

export interface AssigneeInfo {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  project_id: number;
  assign_id: number;
  title: string;
  description: string;
  category: TaskCategory;
  deadline: string;
  estimated_effort: string;
  status: TaskStatus;
  created_at?: string;
  updated_at?: string;
  project?: ProjectInfo;
  assignee?: AssigneeInfo;
}

export interface TimeLog {
  id: number;
  task_id: number;
  user_id: number;
  description: string;
  hours: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export const taskService = {
  async getTasks(status?: string, projectId?: number): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.append('status', status);
    }
    if (projectId) {
      params.append('project_id', projectId.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch<Task[]>(`/tasks${queryString}`, {
      method: 'GET',
    });
  },

  async getTaskById(id: number): Promise<ApiResponse<Task>> {
    return await apiFetch<Task>(`/tasks/${id}`, {
      method: 'GET',
    });
  },

  async updateTaskStatus(id: number, status: TaskStatus): Promise<ApiResponse<Task>> {
    return await apiFetch<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getTimeLogs(taskId: number): Promise<ApiResponse<TimeLog[]>> {
    return await apiFetch<TimeLog[]>(`/tasks/${taskId}/time-logs`, {
      method: 'GET',
    });
  },

  async addTimeLog(taskId: number, description: string, hours: string): Promise<ApiResponse<TimeLog>> {
    return await apiFetch<TimeLog>(`/tasks/${taskId}/time-logs`, {
      method: 'POST',
      body: JSON.stringify({ description, hours }),
    });
  },

  getStatusBadgeColor(status: TaskStatus): string {
    switch (status) {
      case 'todo':
        return 'warning';
      case 'in_progress':
        return 'primary';
      case 'review':
        return 'tertiary';
      case 'done':
        return 'success';
      default:
        return 'medium';
    }
  },

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'In Review';
      case 'done':
        return 'Selesai';
      default:
        return status;
    }
  },

  getCategoryColor(category: TaskCategory): string {
    switch (category?.toLowerCase()) {
      case 'frontend':
        return 'secondary';
      case 'backend':
        return 'dark';
      case 'design':
        return 'rose';
      case 'qa':
        return 'warning';
      default:
        return 'medium';
    }
  }
};
