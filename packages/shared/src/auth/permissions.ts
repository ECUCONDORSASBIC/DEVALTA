/**
 * Matriz de permisos por tipo de usuario
 * ALTAMEDICA - Sistema Unificado de Autenticación
 */

import { UserType } from '../types/user';

export const PERMISSIONS_MATRIX: Record<UserType, string[]> = {
  patient: [
    'read:own_profile',
    'update:own_profile',
    'read:own_appointments',
    'create:appointment',
    'read:own_medical_records',
    'telemedicine:patient'
  ],
  doctor: [
    'read:patients',
    'read:appointments',
    'update:appointments',
    'create:medical_record',
    'read:medical_records',
    'update:medical_records',
    'create:prescription',
    'telemedicine:doctor'
  ],
  company: [
    'read:company_patients',
    'read:company_reports',
    'manage:company_users',
    'billing:access'
  ],
  admin: ['*'] // Wildcard para todos los permisos
};

/**
 * Obtiene las aplicaciones a las que puede acceder un tipo de usuario
 */
export function getAppAccess(userType: UserType): string[] {
  switch (userType) {
    case 'patient': 
      return ['patients'];
    case 'doctor': 
      return ['doctors'];
    case 'company': 
      return ['companies'];
    case 'admin': 
      return ['*'];
    default: 
      return [];
  }
}

/**
 * Verifica si el usuario tiene los permisos requeridos
 */
export function hasPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  if (userPermissions.includes('*')) return true;
  return requiredPermissions.every(perm => userPermissions.includes(perm));
}

/**
 * Verifica si el usuario tiene acceso a una aplicación específica
 */
export function hasAppAccess(userAppAccess: string[], appName: string): boolean {
  return userAppAccess.includes('*') || userAppAccess.includes(appName);
}

/**
 * Obtiene todos los permisos disponibles en el sistema
 */
export function getAllPermissions(): string[] {
  const allPerms = Object.values(PERMISSIONS_MATRIX)
    .flat()
    .filter(perm => perm !== '*');
  return [...new Set(allPerms)];
}

/**
 * Valida que un conjunto de permisos sean válidos
 */
export function validatePermissions(permissions: string[]): boolean {
  if (permissions.includes('*')) return true;
  const validPermissions = getAllPermissions();
  return permissions.every(perm => validPermissions.includes(perm));
}
