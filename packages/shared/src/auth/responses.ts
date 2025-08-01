/**
 * Standardized authentication and authorization error responses
 * These responses are used consistently across all microservices
 */

import { AUTH_CONSTANTS } from './constants';

export interface AuthErrorResponse {
  success: false;
  timestamp: string;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Creates a standardized 401 Unauthorized response
 */
export function createUnauthorizedResponse(message?: string, details?: Record<string, unknown>): AuthErrorResponse {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: AUTH_CONSTANTS.ERROR_CODES.UNAUTHORIZED,
      message: message || 'Authentication required',
      ...(details && { details }),
    },
  };
}

/**
 * Creates a standardized 403 Forbidden response
 */
export function createForbiddenResponse(message?: string, details?: Record<string, unknown>): AuthErrorResponse {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: AUTH_CONSTANTS.ERROR_CODES.FORBIDDEN,
      message: message || 'Access denied',
      ...(details && { details }),
    },
  };
}

/**
 * Creates a standardized response for missing token
 */
export function createTokenMissingResponse(): AuthErrorResponse {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: AUTH_CONSTANTS.ERROR_CODES.TOKEN_MISSING,
      message: 'Authentication token is required',
    },
  };
}

/**
 * Creates a standardized response for invalid token
 */
export function createTokenInvalidResponse(details?: string): AuthErrorResponse {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: AUTH_CONSTANTS.ERROR_CODES.TOKEN_INVALID,
      message: 'Invalid or expired token',
      ...(details && { details: { reason: details } }),
    },
  };
}

/**
 * Creates a standardized response for expired token
 */
export function createTokenExpiredResponse(): AuthErrorResponse {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: AUTH_CONSTANTS.ERROR_CODES.TOKEN_EXPIRED,
      message: 'Token has expired',
    },
  };
}

/**
 * Helper function to send JSON error response for Express
 */
export function sendAuthErrorResponse(res: any, statusCode: number, authError: AuthErrorResponse) {
  return res.status(statusCode).json(authError);
}

/**
 * Common auth error responses for quick access
 */
export const AUTH_RESPONSES = {
  UNAUTHORIZED: createUnauthorizedResponse(),
  FORBIDDEN: createForbiddenResponse(),
  TOKEN_MISSING: createTokenMissingResponse(),
  TOKEN_INVALID: createTokenInvalidResponse(),
  TOKEN_EXPIRED: createTokenExpiredResponse(),
} as const;
