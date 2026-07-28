import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { loginApi, logoutApi, getMeApi } from "../services/authService";
import type { User } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access_token");
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = () => {
    if (token) {
      logoutApi(token);
    }
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
  };

  // Validate token on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("access_token");
      if (savedToken) {
        try {
          const currentUser = await getMeApi(savedToken);
          if (currentUser.role !== "admin") {
            throw new Error(
              "Akses ditolak. Halaman web ini khusus untuk role admin.",
            );
          }
          setUser(currentUser);
          localStorage.setItem("auth_user", JSON.stringify(currentUser));
        } catch (err: any) {
          console.warn("Authentication token invalid or expired:", err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginApi(email, password);

      if (!response.data || !response.data.access_token) {
        throw new Error("Respons login tidak valid dari server.");
      }

      const { user: loggedInUser, access_token } = response.data;

      // Validate Admin Role
      if (loggedInUser.role !== "admin") {
        throw new Error(
          "Akses ditolak. Akun member hanya dapat login melalui aplikasi mobile.",
        );
      }

      setToken(access_token);
      setUser(loggedInUser);
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("auth_user", JSON.stringify(loggedInUser));
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user && user.role === "admin",
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext harus digunakan di dalam AuthProvider");
  }
  return context;
};
