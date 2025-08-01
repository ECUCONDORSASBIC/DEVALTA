// Firestore Types for ALTAMEDICA Authentication System
// Using basic types to avoid firebase dependency in shared package
export interface Timestamp {
  toDate(): Date;
  toMillis(): number;
  seconds: number;
  nanoseconds: number;
}

import { UserType } from './user';

export interface FirestoreUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  userType: UserType;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  twoFactorEnabled: boolean;
  companyId?: string;
  departmentId?: string;
  specialtyId?: string;
  licenseNumber?: string;
}

export interface FirestoreRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  appAccess: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface FirestorePermission {
  id: string;
  name: string;
  description: string;
  scope: 'global' | 'own' | 'company' | 'department';
  roles: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface FirestoreUserRole {
  userId: string;
  roleId: string;
  assignedAt: Timestamp;
  assignedBy: string;
  expiresAt?: Timestamp;
  isActive: boolean;
}

export interface FirestoreUserPermission {
  userId: string;
  permissionId: string;
  grantedAt: Timestamp;
  grantedBy: string;
  expiresAt?: Timestamp;
  isActive: boolean;
}

export interface FirestoreCompany {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'insurance' | 'other';
  taxId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreDepartment {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  managerId?: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreSpecialty {
  id: string;
  name: string;
  description?: string;
  category: 'medical' | 'surgical' | 'diagnostic' | 'therapeutic';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
  };
  createdAt: Timestamp;
  expiresAt: Timestamp;
  lastActivity: Timestamp;
  isActive: boolean;
}

export interface FirestoreAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: Timestamp;
  success: boolean;
  errorMessage?: string;
} 