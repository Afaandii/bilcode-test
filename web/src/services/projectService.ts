const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
import { type Client } from "./dashboardService";

export interface ProjectTask {
  id?: number;
  project_id?: number;
  assign_id?: number | null;
  title: string;
  description: string;
  category: "frontend" | "backend" | "design" | "QA";
  deadline?: string;
  estimated_effort: string;
  status: "todo" | "in_progress" | "review" | "done";
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  brief: string;
  deadline: string;
  status: "active" | "completed" | "on_hold";
  client?: Client;
  tasks?: ProjectTask[];
}

export interface ProjectFormData {
  client_id: number;
  name: string;
  brief: string;
  deadline: string;
  status: "active" | "completed" | "on_hold";
}

export interface GeneratedAiTask {
  title: string;
  description: string;
  category: "frontend" | "backend" | "design" | "QA";
  estimated_effort: string;
}

export interface ProjectResponse {
  status: string;
  data: Project | Project[];
  message?: string;
}

/**
 * Fetch all projects
 */
export const getProjectsApi = async (token: string): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal mengambil data proyek.");
  }

  return data.data as Project[];
};

/**
 * Get project detail with tasks and client
 */
export const getProjectDetailApi = async (
  token: string,
  id: number,
): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal mengambil detail proyek.");
  }

  return data.data as Project;
};

/**
 * Create a new project
 */
export const createProjectApi = async (
  token: string,
  projectData: ProjectFormData,
): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal membuat proyek baru.");
  }

  return data.data as Project;
};

/**
 * Update an existing project
 */
export const updateProjectApi = async (
  token: string,
  id: number,
  projectData: ProjectFormData,
): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal memperbarui proyek.");
  }

  return data.data as Project;
};

/**
 * Delete a project
 */
export const deleteProjectApi = async (
  token: string,
  id: number,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal menghapus proyek.");
  }
};

/**
 * Generate AI tasks breakdown from project brief (LLM integration)
 */
export const generateAiTasksApi = async (
  token: string,
  projectId: number,
  brief?: string,
): Promise<GeneratedAiTask[]> => {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/tasks/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ brief }),
    },
  );

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal menghasilkan task rekomendasi AI.");
  }

  return data.data as GeneratedAiTask[];
};
