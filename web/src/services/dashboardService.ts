const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface Client {
  id?: number;
  name: string;
  contact: string;
  company: string;
}

export interface MemberWorkload {
  id: number;
  name: string;
  email: string;
  active_tasks_count: number;
}

export interface DashboardSummary {
  active_projects_count: number;
  overdue_tasks_count: number;
  members_workload: MemberWorkload[];
}

export interface DashboardSummaryResponse {
  status: string;
  data: DashboardSummary;
  message?: string;
}

/**
 * Fetch dashboard summary details (Admin only)
 */
export const getDashboardSummaryApi = async (
  token: string,
): Promise<DashboardSummary> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data: DashboardSummaryResponse = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(
      data.message || "Gagal mengambil data ringkasan dashboard.",
    );
  }

  return data.data;
};
