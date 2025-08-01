/**
 * Tipos de usuario y estructuras base para el sistema de autenticación
 * ALTAMEDICA - Sistema Unificado de Autenticación
 */

export type UserType = 'patient' | 'doctor' | 'company' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  userType: UserType;
  status: UserStatus;
  createdAt: Date;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  
  // Campos específicos por tipo de usuario
  companyId?: string;
  departmentId?: string;
  specialtyId?: string;
  licenseNumber?: string;
}

export interface CustomClaims {
  userType: UserType;
  permissions: string[];
  roles: string[];
  appAccess: string[];
  companyId?: string;
  departmentId?: string;
}

export interface AuthUser extends User {
  customClaims: CustomClaims;
}
