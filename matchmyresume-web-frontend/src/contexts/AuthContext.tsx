import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, LoginResponse, RegisterRequest, LoginRequest } from '../services/authApi';
import { authApi } from '../services/authApi';
import { setAuthRefresh } from '../services/authRefresh';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Token storage keys (must match bffApi and authApi)
  const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'matchmyresume_access_token';
  const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'matchmyresume_refresh_token';
  const USER_PROFILE_KEY = import.meta.env.VITE_USER_PROFILE_KEY || 'matchmyresume_user_profile';

  useEffect(() => {
    setAuthRefresh(refreshAuth);
    return () => setAuthRefresh(null);
  }, []);

  useEffect(() => {
    // Check for existing tokens and user data on app start
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_PROFILE_KEY);

        if (accessToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Optionally verify token with backend
          try {
            await authApi.getProfile();
          } catch (error) {
            // Token might be expired, try to refresh
            await refreshAuth();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid stored data
        clearStoredAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const storeAuthData = (authData: LoginResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, authData.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, authData.refresh_token);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(authData.user));
    setUser(authData.user);
  };

  const clearStoredAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
    setUser(null);
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const authData = await authApi.login(credentials);
      storeAuthData(authData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await authApi.register(userData);
      // Note: Registration doesn't automatically log in - user needs to verify email first
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await authApi.logout({ refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      clearStoredAuth();
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const authData = await authApi.refreshToken({ refresh_token: refreshToken });
      const freshUser = await authApi.getProfile();
      storeAuthData({
        ...authData,
        user: freshUser,
      });
    } catch (error) {
      await logout();
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const freshUser = await authApi.getProfile();
      setUser(freshUser);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(freshUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAuth,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};