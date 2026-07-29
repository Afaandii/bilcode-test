import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.getToken()) {
        try {
          const res = await authService.me();
          if (res.status === 'success' && res.data?.user) {
            setUser(res.data.user);
          } else {
            // Token invalid or expired
            setUser(null);
            setToken(null);
          }
        } catch {
          // Keep local user info if offline or server temporary error
          setUser(authService.getUser());
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await authService.login(email, password);
    setIsLoading(false);

    if (res.status === 'success' && res.data) {
      setUser(res.data.user);
      setToken(res.data.access_token);
      return { success: true, message: res.message || 'Login berhasil' };
    } else {
      return {
        success: false,
        message: res.message || 'Login gagal. Periksa email dan password.',
      };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setToken(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    const res = await authService.me();
    if (res.status === 'success' && res.data?.user) {
      setUser(res.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
