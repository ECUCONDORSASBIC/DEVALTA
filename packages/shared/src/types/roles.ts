// Role definitions for AltaMedica Platform RBAC system

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  COMPANY_ADMIN = 'company-admin',
  PLATFORM_ADMIN = 'platform-admin'
}

export interface RolePermissions {
  canAccessPatientPortal: boolean;
  canAccessDoctorPortal: boolean;
  canAccessCompanyPortal: boolean;
  canAccessAdminPanel: boolean;
  canManageAppointments: boolean;
  canViewMedicalRecords: boolean;
  canPrescribeMedication: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageBilling: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.PATIENT]: {
    canAccessPatientPortal: true,
    canAccessDoctorPortal: false,
    canAccessCompanyPortal: false,
    canAccessAdminPanel: false,
    canManageAppointments: true,
    canViewMedicalRecords: true,
    canPrescribeMedication: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageBilling: true
  },
  [UserRole.DOCTOR]: {
    canAccessPatientPortal: false,
    canAccessDoctorPortal: true,
    canAccessCompanyPortal: false,
    canAccessAdminPanel: false,
    canManageAppointments: true,
    canViewMedicalRecords: true,
    canPrescribeMedication: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageBilling: true
  },
  [UserRole.COMPANY_ADMIN]: {
    canAccessPatientPortal: false,
    canAccessDoctorPortal: false,
    canAccessCompanyPortal: true,
    canAccessAdminPanel: false,
    canManageAppointments: true,
    canViewMedicalRecords: false,
    canPrescribeMedication: false,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageBilling: true
  },
  [UserRole.PLATFORM_ADMIN]: {
    canAccessPatientPortal: true,
    canAccessDoctorPortal: true,
    canAccessCompanyPortal: true,
    canAccessAdminPanel: true,
    canManageAppointments: true,
    canViewMedicalRecords: true,
    canPrescribeMedication: false,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageBilling: true
  }
};

// Route definitions for each role
export const ROLE_ROUTES: Record<UserRole, string> = {
  [UserRole.PATIENT]: '/patients/dashboard',
  [UserRole.DOCTOR]: '/doctors/dashboard',
  [UserRole.COMPANY_ADMIN]: '/companies/dashboard',
  [UserRole.PLATFORM_ADMIN]: '/admin/dashboard'
};

// Application mapping for each role
export const ROLE_APPS: Record<UserRole, string> = {
  [UserRole.PATIENT]: 'patients',
  [UserRole.DOCTOR]: 'doctors',
  [UserRole.COMPANY_ADMIN]: 'companies',
  [UserRole.PLATFORM_ADMIN]: 'admin'
};