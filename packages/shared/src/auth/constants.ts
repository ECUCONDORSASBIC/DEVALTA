/**
 * Authentication constants for ALTAMEDICA platform
 */

export const AUTH_CONSTANTS = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'altamedica-jwt-secret-2025',
  JWT_ALGORITHM: 'HS256' as const,
  
  // Token expiration times
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  SESSION_DURATION: 60 * 60 * 24 * 7, // 7 days in seconds
  
  // Storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'altamedica_token',
    REFRESH_TOKEN: 'altamedica_refresh',
    USER_PROFILE: 'altamedica_profile',
    SESSION_ID: 'altamedica_session',
  },
  
  // Cookie configuration
  COOKIE_CONFIG: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
    path: '/',
  },
  
  // User types
  USER_TYPES: {
    PATIENT: 'patient',
    DOCTOR: 'doctor', 
    COMPANY: 'company',
    ADMIN: 'admin',
  } as const,
  
  // Authentication URLs
  AUTH_URLS: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  
  // Error codes
  ERROR_CODES: {
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    TOKEN_MISSING: 'TOKEN_MISSING',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  },
} as const;

export type ErrorCode = typeof AUTH_CONSTANTS.ERROR_CODES[keyof typeof AUTH_CONSTANTS.ERROR_CODES];

// Re-export UserType from the main types
export type { UserType } from '../types/user';
