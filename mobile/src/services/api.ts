const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};

export const getStoredUser = (): any | null => {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: any): void => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        removeStoredToken();
      }
      return {
        status: "error",
        message:
          data.message || `Request failed with status ${response.status}`,
        errors: data.errors,
      };
    }

    return data;
  } catch (error: any) {
    return {
      status: "error",
      message:
        error.message ||
        "Gagal terhubung ke server backend. Pastikan server berjalan.",
    };
  }
}
