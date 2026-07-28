const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
import { type TimeLogItem } from "./taskService";

export interface TimeLogFilter {
  project_id?: string | number;
  user_id?: string | number;
  task_id?: string | number;
}

export interface TimeLogResponse {
  status: string;
  data: TimeLogItem[];
  message?: string;
}

/**
 * Fetch time logs with optional filters (Admin can filter by user_id, project_id, task_id)
 */
export const getTimeLogsApi = async (
  token: string,
  filters?: TimeLogFilter,
): Promise<TimeLogItem[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.project_id)
    queryParams.append("project_id", String(filters.project_id));
  if (filters?.user_id) queryParams.append("user_id", String(filters.user_id));
  if (filters?.task_id) queryParams.append("task_id", String(filters.task_id));

  const url = `${API_BASE_URL}/time-logs?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data: TimeLogResponse = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Gagal mengambil data laporan jam kerja.");
  }

  return data.data;
};
