const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
import { type ProjectTask } from "./projectService";

export interface TaskFormData {
  project_id?: number;
  assign_id: number;
  title: string;
  description: string;
  category: "frontend" | "backend" | "design" | "QA";
  deadline: string;
  estimated_effort: string;
  status: "todo" | "in_progress" | "review" | "done";
}

export interface TimeLogItem {
  id: number;
  task_id: number;
  user_id: number;
  description: string;
  hours: string;
  created_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface FullProjectTask extends ProjectTask {
  time_logs?: TimeLogItem[];
  timeLogs?: TimeLogItem[];
  project?: {
    client_id: number;
    name: string;
    brief: string;
    deadline: string;
    status: "active" | "completed" | "on_hold";
  };
}

export interface TaskFilters {
  assignee?: string | number;
  status?: string;
  project_id?: string | number;
}

export interface TaskResponse {
  status: string;
  data: FullProjectTask | FullProjectTask[];
  message?: string;
}

/**
 * Fetch list of tasks with optional filters
 */
export const getTasksApi = async (
  token: string,
  filters?: TaskFilters,
): Promise<FullProjectTask[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.assignee)
    queryParams.append("assignee", String(filters.assignee));
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.project_id)
    queryParams.append("project_id", String(filters.project_id));

  const url = `${API_BASE_URL}/tasks?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data: TaskResponse = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal mengambil daftar task.");
  }

  return data.data as FullProjectTask[];
};

/**
 * Get detailed task information including time logs
 */
export const getTaskDetailApi = async (
  token: string,
  id: number,
): Promise<FullProjectTask> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data: TaskResponse = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal mengambil detail task.");
  }

  return data.data as FullProjectTask;
};

/**
 * Store a task under a project
 */
export const createProjectTaskApi = async (
  token: string,
  projectId: number,
  taskData: TaskFormData,
): Promise<ProjectTask> => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal menyimpan task proyek.");
  }

  return data.data as ProjectTask;
};

/**
 * Update an existing task (Admin only)
 */
export const updateTaskApi = async (
  token: string,
  id: number,
  taskData: Partial<TaskFormData>,
): Promise<ProjectTask> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal memperbarui task.");
  }

  return data.data as ProjectTask;
};

/**
 * Delete a task
 */
export const deleteTaskApi = async (
  token: string,
  id: number,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal menghapus task.");
  }
};
