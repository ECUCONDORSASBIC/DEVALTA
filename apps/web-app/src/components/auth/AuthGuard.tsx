'use client';

// 🚀 MIGRATED: Este archivo ahora usa el AuthGuard unificado de @altamedica/auth
// Mantiene compatibilidad con el código existente de web-app

import { AuthGuard as UnifiedAuthGuard } from '@altamedica/auth';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { UserRole } from '@altamedica/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'patient' | 'doctor' | 'company' | 'admin';
  redirectTo?: string;
  fallback?: React.ReactNode;
}

// Mapeo de roles string a UserRole enum
const roleMap: Record<string, UserRole> = {
  'patient': UserRole.PATIENT,
  'doctor': UserRole.DOCTOR,
  'company': UserRole.COMPANY,
  'admin': UserRole.ADMIN
};

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/auth/login',
  fallback
}) => {
  // Convertir requireRole string a UserRole enum si existe
  const mappedRole = requireRole ? roleMap[requireRole] : undefined;

  return (
    <UnifiedAuthGuard
      requireAuth={requireAuth}
      requireRole={mappedRole}
      fallbackRedirect={redirectTo}
      loadingComponent={fallback || <LoadingScreen />}
      checkSSO={true} // Habilitar verificación SSO
      debugMode={process.env.NODE_ENV === 'development'}
    >
      {children}
    </UnifiedAuthGuard>
  );
};

export default AuthGuard;