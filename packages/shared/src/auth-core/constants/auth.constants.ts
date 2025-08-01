// Auth Core Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  PROFILE: '/api/users/profile',
  ME: '/api/auth/me',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  USER_TYPE: 'userType',
  REFRESH_TOKEN: 'refreshToken',
  SESSION_EXPIRY: 'sessionExpiry',
} as const;

export const AUTH_STATUS = {
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  LOADING: 'loading',
  ERROR: 'error',
} as const;

export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  COMPANY: 'company',
  ADMIN: 'admin',
} as const;

export const DASHBOARD_URLS = {
  [USER_ROLES.PATIENT]: '/dashboard',
  [USER_ROLES.DOCTOR]: '/dashboard',
  [USER_ROLES.COMPANY]: '/dashboard',
  [USER_ROLES.ADMIN]: '/dashboard',
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
} as const;

export const DEFAULT_LOADING_STATE = {
  isLoading: false,
  error: null,
} as const;

export const DEFAULT_AUTH_STATE = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: undefined,
} as const;
