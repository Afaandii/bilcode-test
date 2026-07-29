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

  getStatusBadgeColor(status: TaskStatus): string {
    switch (status) {
      case 'todo':
        return 'warning'; // Orange / Yellow
      case 'in_progress':
        return 'primary'; // Blue
      case 'review':
        return 'tertiary'; // Purple
      case 'done':
        return 'success'; // Green
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
