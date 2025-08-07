'use client';

// apps/patients/src/components/auth/AuthGuard.tsx
import { LoadingSpinner } from '@altamedica/ui';
import { useAuth } from '@/providers/AuthProviderUnified';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { hasSSOToken, hasValidPatientSession, logSSOState } from '../../utils/sso-cookies';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const authState = useAuth();
  const { isAuthenticated, isLoading, error } = authState;
  const pathname = usePathname();
  const [hasCheckedSSO, setHasCheckedSSO] = useState(false);

  // Rutas que no requieren autenticación (añadimos debug para diagnóstico)
  const publicRoutes: string[] = ['/debug']; 
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    console.log('🔍 [AuthGuard] Estado actual:', {
      isAuthenticated,
      isLoading,
      error,
      user: authState.user ? { uid: authState.user.uid, email: authState.user.email, role: authState.user.role } : null,
      pathname,
      isPublicRoute,
      hasCheckedSSO
    });

    // Log del estado SSO para debugging
    logSSOState();

    // Si es una ruta pública, no redirigir
    if (isPublicRoute) {
      console.log('📍 [AuthGuard] Ruta pública, permitiendo acceso');
      return;
    }

    // Verificar SSO una sola vez
    if (!hasCheckedSSO) {
      const hasSSOSession = hasValidPatientSession();
      console.log('🍪 [AuthGuard] Verificación SSO:', { hasSSOSession, hasSSOToken: hasSSOToken() });
      
      if (hasSSOSession) {
        console.log('✅ [AuthGuard] Sesión SSO válida encontrada, permitiendo acceso');
        setHasCheckedSSO(true);
        return; // No redirigir si hay sesión SSO válida
      }
      
      setHasCheckedSSO(true);
    }

    // Dar más tiempo para la carga inicial
    if (isLoading) {
      console.log('⏳ [AuthGuard] Aún cargando autenticación...');
      return;
    }

    // Si hay usuario autenticado, permitir acceso
    if (isAuthenticated && authState.user) {
      console.log('✅ [AuthGuard] Usuario autenticado:', authState.user.email, 'Role:', authState.user.role);
      return;
    }

    // Solo redirigir si definitivamente no está autenticado, no está cargando Y no hay SSO
    if (!isAuthenticated && !isLoading && hasCheckedSSO) {
      const hasSSO = hasValidPatientSession();
      
      if (hasSSO) {
        console.log('🍪 [AuthGuard] Sesión SSO válida, NO redirigiendo');
        return;
      }
      
      console.log('🔐 [AuthGuard] Usuario no autenticado y sin SSO, preparando redirección...');
      console.log('🔐 [AuthGuard] Datos completos:', { isAuthenticated, isLoading, error, user: authState.user, hasSSO });
      
      // Dar tiempo adicional para que Firebase cargue la sesión persistida
      const redirectTimer = setTimeout(() => {
        // Verificar una vez más antes de redirigir (incluyendo SSO)
        if (!authState.isAuthenticated && !authState.isLoading && !hasValidPatientSession()) {
          const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000';
          const currentUrl = window.location.href;
          const redirectUrl = `${webAppUrl}/login?redirect=${encodeURIComponent(currentUrl)}&role=patient`;
          console.log('🔗 [AuthGuard] Redirigiendo definitivamente a:', redirectUrl);
          window.location.href = redirectUrl;
        } else {
          console.log('✅ [AuthGuard] Usuario autenticado o SSO válido detectado, cancelando redirección');
        }
      }, 8000); // Aumentar a 8 segundos para dar más tiempo
      
      // Limpiar timer si el componente se desmonta
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, isPublicRoute, authState.user, error, hasCheckedSSO]);

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 mx-auto">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <LoadingSpinner size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AltaMedica</h2>
            <p className="text-gray-600">Verificando autenticación...</p>
            <p className="text-xs text-gray-500 mt-2">Debug: isLoading={isLoading.toString()}, isAuth={isAuthenticated.toString()}</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problemas de autenticación
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r from-red-600 to-red-700 mx-auto">
            <span className="text-2xl font-bold text-white">!</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mb-4">
              Debug: isAuth={isAuthenticated.toString()}, user={authState.user?.email || 'null'}
            </div>
            <button
              onClick={() => {
                const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000';
                window.location.href = `${webAppUrl}/login`;
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si es una ruta pública, mostrar siempre
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Si no está autenticado, mostrar mensaje con info de debug
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 mx-auto">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirigiendo...</h2>
            <p className="text-gray-600">Te estamos llevando al portal de login</p>
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mt-4">
              Debug: isAuth={isAuthenticated.toString()}, isLoading={isLoading.toString()}, user={authState.user?.email || 'null'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado, mostrar la aplicación
  return <>{children}</>;
}