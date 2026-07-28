const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string | null;
}

export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    user: User;
    access_token: string;
    token_type: string;
  };
  errors?: Record<string, string[]>;
}

/**
 * Login user via Sanctum API using native fetch
 */
export const loginApi = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Login gagal. Periksa kembali email dan kata sandi Anda.",
    );
  }

  return data;
};

/**
 * Logout user via Sanctum API
 */
export const logoutApi = async (token: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

/**
 * Get active authenticated user details
 */
export const getMeApi = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Sesi login telah berakhir.");
  }

  return data.data.user;
};
