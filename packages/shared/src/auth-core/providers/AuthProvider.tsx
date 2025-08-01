// AuthProvider - Provides auth context to the application
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AuthService from '../services/AuthService';
import { AuthProviderProps, AuthContextType, User, AuthState, LoginCredentials, RegisterData } from '../types/auth.types';
import { DEFAULT_AUTH_STATE } from '../constants/auth.constants';

// Create a singleton instance
const authService = new AuthService();

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: undefined,
  login: async (credentials) => { throw new Error('Not implemented'); },
  register: async (data) => { throw new Error('Not implemented'); },
  logout: () => {},
  refresh: async () => {},
  updateProfile: async (profileData) => { throw new Error('Not implemented'); },
  refreshProfile: async () => { throw new Error('Not implemented'); },
  authenticatedFetch: async (url, options) => { return await fetch(url, options); },
  hasRole: () => false,
  hasPermission: () => false,
  getDashboardUrl: () => '/',
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);

  useEffect(() => {
    const initializeAuth = async () => {
      const state = authService.getAuthState();
      setAuthState(state);
    };
    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
    try {
      await authService.login(credentials);
      const newState = authService.getAuthState();
      setAuthState(newState);
      return newState.user!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
    try {
      await authService.register(data);
      const newState = authService.getAuthState();
      setAuthState(newState);
      return newState.user!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    const newState = authService.getAuthState();
    setAuthState(newState);
  }, []);

  const refresh = useCallback(async () => {
    try {
      await authService.refresh();
      const newState = authService.getAuthState();
      setAuthState(newState);
    } catch (error) {
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    // Implementation would go here
    throw new Error('Not implemented');
  }, [authState.user]);

  const refreshProfile = useCallback(async () => {
    // Implementation would go here
    throw new Error('Not implemented');
  }, []);

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      logout();
      throw new Error('Session expired');
    }
    
    return response;
  }, [logout]);

  const hasRole = useCallback((role: string | string[]) => {
    if (!authState.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(authState.user.userType);
    }
    
    return authState.user.userType === role;
  }, [authState.user]);

  const hasPermission = useCallback((permission: string) => {
    if (!authState.user) return false;
    // Implementation would check user permissions
    return false;
  }, [authState.user]);

  const getDashboardUrl = useCallback(() => {
    if (!authState.user) return '/';
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    
    switch (authState.user.userType) {
      case 'patient':
        return `${baseUrl.replace('3001', '3002')}/dashboard`;
      case 'doctor':
        return `${baseUrl.replace('3001', '3003')}/dashboard`;
      case 'company':
        return `${baseUrl.replace('3001', '3004')}/dashboard`;
      case 'admin':
        return `${baseUrl.replace('3001', '3006')}/dashboard`;
      default:
        return '/dashboard';
    }
  }, [authState.user]);

  const value = {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    login,
    register,
    logout,
    refresh,
    updateProfile,
    refreshProfile,
    authenticatedFetch,
    hasRole,
    hasPermission,
    getDashboardUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

