import { apiFetch, ApiResponse, setStoredToken, setStoredUser, removeStoredToken, getStoredUser, getStoredToken } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member' | string;
}

export interface LoginResponseData {
  user: User;
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponseData>> {
    const response = await apiFetch<LoginResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 'success' && response.data) {
      setStoredToken(response.data.access_token);
      setStoredUser(response.data.user);
    }

    return response;
  },

  async logout(): Promise<ApiResponse> {
    try {
      const response = await apiFetch('/auth/logout', {
        method: 'POST',
      });
      removeStoredToken();
      return response;
    } catch {
      removeStoredToken();
      return { status: 'success', message: 'Logged out locally.' };
    }
  },

  async me(): Promise<ApiResponse<{ user: User }>> {
    const response = await apiFetch<{ user: User }>('/auth/me', {
      method: 'GET',
    });

    if (response.status === 'success' && response.data?.user) {
      setStoredUser(response.data.user);
    }

    return response;
  },

  getUser(): User | null {
    return getStoredUser();
  },

  getToken(): string | null {
    return getStoredToken();
  },

  isAuthenticated(): boolean {
    return !!getStoredToken();
  }
};
