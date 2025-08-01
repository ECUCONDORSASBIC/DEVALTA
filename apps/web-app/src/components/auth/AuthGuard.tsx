'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { getDashboardUrl } from '@/config/app-urls';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'patient' | 'doctor' | 'company' | 'admin';
  redirectTo?: string;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/login',
  fallback
}) => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Si requiere autenticación y no hay usuario
    if (requireAuth && !user) {
      // Guardar la ruta intentada para redirigir después del login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push(redirectTo);
      return;
    }

    // Si requiere un rol específico
    if (requireRole && userProfile) {
      if (userProfile.role !== requireRole) {
        // Redirigir según el rol del usuario
        const userRedirect = userProfile.role === 'patient' 
          ? '/dashboard'
          : getDashboardUrl(userProfile.role as any);
        
        // Si es una URL externa, usar window.location
        if (userRedirect.startsWith('http')) {
          window.location.href = userRedirect;
        } else {
          router.push(userRedirect);
        }
      }
    }
  }, [user, userProfile, loading, requireAuth, requireRole, router, pathname, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return fallback || <LoadingScreen />;
  }

  // Si requiere auth y no hay usuario, no renderizar nada (se está redirigiendo)
  if (requireAuth && !user) {
    return fallback || null;
  }

  // Si requiere un rol específico y no coincide, no renderizar
  if (requireRole && userProfile && userProfile.role !== requireRole) {
    return fallback || null;
  }

  // Todo OK, renderizar children
  return <>{children}</>;
};

export default AuthGuard;