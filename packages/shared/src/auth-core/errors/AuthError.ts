// Auth Core Error Classes
import { AUTH_ERRORS } from '../constants/auth.constants';

export class AuthError extends Error {
  public code: string;
  public details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'AuthError';
  }

  static invalidCredentials(message = 'Invalid credentials') {
    return new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS, message);
  }

  static sessionExpired(message = 'Session expired') {
    return new AuthError(AUTH_ERRORS.SESSION_EXPIRED, message);
  }

  static networkError(message = 'Network error') {
    return new AuthError(AUTH_ERRORS.NETWORK_ERROR, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AuthError(AUTH_ERRORS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden') {
    return new AuthError(AUTH_ERRORS.FORBIDDEN, message);
  }

  static tokenExpired(message = 'Token expired') {
    return new AuthError(AUTH_ERRORS.TOKEN_EXPIRED, message);
  }

  static invalidToken(message = 'Invalid token') {
    return new AuthError(AUTH_ERRORS.INVALID_TOKEN, message);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export class NetworkError extends AuthError {
  constructor(message = 'Network error', details?: any) {
    super(AUTH_ERRORS.NETWORK_ERROR, message, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AuthError {
  constructor(message = 'Validation error', details?: any) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export default AuthError;
