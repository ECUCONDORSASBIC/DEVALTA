// Auth utilities
import { STORAGE_KEYS, USER_ROLES } from '../constants/auth.constants';
import { User } from '../../types/user';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};

export const getStoredRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.USER_TYPE);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const setStoredUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.USER_TYPE);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
};

export const isValidRole = (role: string): boolean => {
  return Object.values(USER_ROLES).includes(role as any);
};

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  // Implementation would check user permissions
  return false;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export const formatUserDisplayName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};

export const getUserInitials = (user: User): string => {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const generateAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const handleAuthError = (error: any): string => {
  if (error.response?.status === 401) {
    return 'Invalid credentials';
  }
  if (error.response?.status === 403) {
    return 'Access denied';
  }
  if (error.response?.status === 429) {
    return 'Too many requests. Please try again later.';
  }
  return error.message || 'An error occurred';
};

export const createAuthState = (user: User | null, token: string | null, isLoading = false) => {
  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
  };
};

export const authUtils = {
  getStoredToken,
  getStoredUser,
  getStoredRole,
  setStoredToken,
  setStoredUser,
  clearStoredAuth,
  isValidRole,
  hasPermission,
  isTokenExpired,
  getTokenPayload,
  formatUserDisplayName,
  getUserInitials,
  validateEmail,
  validatePassword,
  generateAuthHeaders,
  handleAuthError,
  createAuthState,
};
