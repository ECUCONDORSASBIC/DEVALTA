'use client';

// 🚀 MIGRATED: Este archivo ahora usa el RouteGuard unificado de @altamedica/auth
// Mantiene compatibilidad con el código existente de web-app

import { RouteGuard as UnifiedRouteGuard } from '@altamedica/auth';
import { AuthLoading } from './AuthLoading';
import { AccessDenied } from './AccessDenied';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: string[];
  redirectUrl?: string;
  fallbackRedirect?: string;
}

export function RouteGuard({
  children,
  requireAuth = true,
  allowedUserTypes,
  redirectUrl = '/auth/login',
  fallbackRedirect = '/auth/login'
}: RouteGuardProps) {
  return (
    <UnifiedRouteGuard
      requireAuth={requireAuth}
      allowedUserTypes={allowedUserTypes}
      fallbackRedirect={fallbackRedirect || redirectUrl}
      loadingComponent={<AuthLoading />}
      accessDeniedComponent={<AccessDenied />}
      checkSSO={true}
      debugMode={process.env.NODE_ENV === 'development'}
    >
      {children}
    </UnifiedRouteGuard>
  );
}