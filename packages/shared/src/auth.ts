/**
 * 🔒 AUTHENTICATION UTILITIES
 * Basic auth functions for development - should be replaced with Firebase Admin in production
 */

import { consoleLogger } from './index';

export interface AuthTokenPayload {
  uid: string;
  email: string;
  userType: 'patient' | 'doctor' | 'company' | 'admin';
  role?: string;
  permissions?: string[];
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  // Implementación básica para desarrollo
  consoleLogger.warn('Using basic auth verification - implement Firebase Admin in production');
  
  if (!token || token.length < 10) {
    throw new Error('Invalid token');
  }
  
  // Simular diferentes tipos de usuarios para testing
  if (token.includes('company')) {
    return {
      uid: 'company-test-uid',
      email: 'company@altamedica.com',
      userType: 'company',
      role: 'company-admin',
      permissions: ['read:dashboard', 'write:staff', 'read:analytics']
    };
  }
  
  if (token.includes('doctor')) {
    return {
      uid: 'doctor-test-uid',
      email: 'doctor@altamedica.com',
      userType: 'doctor',
      role: 'medical-professional',
      permissions: ['read:patients', 'write:appointments']
    };
  }
  
  if (token.includes('admin')) {
    return {
      uid: 'admin-test-uid',
      email: 'admin@altamedica.com',
      userType: 'admin',
      role: 'system-admin',
      permissions: ['*']
    };
  }
  
  // Usuario por defecto (paciente)
  return {
    uid: 'patient-test-uid',
    email: 'patient@altamedica.com',
    userType: 'patient',
    role: 'patient',
    permissions: ['read:profile', 'write:appointments']
  };
}

export async function authenticateRequest(authHeader: string | null): Promise<AuthTokenPayload | null> {
  const token = extractBearerToken(authHeader);
  if (!token) {
    return null;
  }
  
  try {
    return verifyAuthToken(token);
  } catch (error) {
    consoleLogger.error('Error verifying auth token', error);
    return null;
  }
}

export function hasPermission(user: AuthTokenPayload, permission: string): boolean {
  if (!user.permissions) return false;
  
  // Admin wildcard permission
  if (user.permissions.includes('*')) return true;
  
  // Exact permission match
  if (user.permissions.includes(permission)) return true;
  
  // Pattern matching (e.g., "read:*" matches "read:dashboard")
  return user.permissions.some(p => {
    if (p.endsWith(':*')) {
      const prefix = p.slice(0, -1);
      return permission.startsWith(prefix);
    }
    return false;
  });
}

export function requireRole(user: AuthTokenPayload, requiredRole: string): boolean {
  return user.role === requiredRole;
}

export function requireUserType(user: AuthTokenPayload, userType: AuthTokenPayload['userType']): boolean {
  return user.userType === userType;
}