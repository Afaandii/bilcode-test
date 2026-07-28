const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Client {
  id: number;
  name: string;
  contact?: string;
  company?: string;
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  brief: string;
  deadline: string;
  status: 'active' | 'completed' | 'on_hold';
  client?: Client;
}

export interface ProjectsResponse {
  status: string;
  data: Project[];
  message?: string;
}

/**
 * Fetch all projects with client details
 */
export const getProjectsApi = async (token: string): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ProjectsResponse = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Gagal mengambil data proyek.');
  }

  return data.data;
};
