/**
 * Roles de usuario en el sistema AltaMedica
 */
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor', 
  COMPANY_ADMIN = 'company-admin',
  PLATFORM_ADMIN = 'platform-admin'
}

/**
 * Mapeo de roles a nombres legibles
 */
export const UserRoleNames: Record<UserRole, string> = {
  [UserRole.PATIENT]: 'Paciente',
  [UserRole.DOCTOR]: 'Doctor',
  [UserRole.COMPANY_ADMIN]: 'Administrador de Empresa',
  [UserRole.PLATFORM_ADMIN]: 'Administrador de Plataforma'
};

/**
 * Verificar si un rol tiene permisos de administrador
 */
export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.PLATFORM_ADMIN || role === UserRole.COMPANY_ADMIN;
}

/**
 * Verificar si un rol es médico
 */
export function isMedicalRole(role: UserRole): boolean {
  return role === UserRole.DOCTOR;
}

/**
 * Obtener la URL de redirección por defecto para cada rol
 */
export function getDefaultRedirectUrl(role: UserRole): string {
  const redirectMap: Record<UserRole, string> = {
    [UserRole.PATIENT]: '/dashboard',
    [UserRole.DOCTOR]: '/dashboard',
    [UserRole.COMPANY_ADMIN]: '/dashboard',
    [UserRole.PLATFORM_ADMIN]: '/admin'
  };
  
  return redirectMap[role] || '/';
}

/**
 * Obtener el puerto de la aplicación por rol (desarrollo)
 */
export function getAppPortByRole(role: UserRole): number {
  const portMap: Record<UserRole, number> = {
    [UserRole.PATIENT]: 3003,
    [UserRole.DOCTOR]: 3002,
    [UserRole.COMPANY_ADMIN]: 3004,
    [UserRole.PLATFORM_ADMIN]: 3005
  };
  
  return portMap[role] || 3000;
}