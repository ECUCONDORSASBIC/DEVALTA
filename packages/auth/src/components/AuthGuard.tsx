'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../services/AuthService';
import { getDashboardUrl } from '../utils/redirects';

// 🛡️ UNIFIED AUTH GUARD - Combina lo mejor de todas las implementaciones
// Soporta SSO, roles, permisos, y configuración flexible

export interface AuthGuardProps {
  children: ReactNode;
  
  // Configuración de autenticación
  requireAuth?: boolean;
  requireRole?: UserRole | UserRole[];
  allowedUserTypes?: string[];
  
  // Configuración de redirección
  fallbackRedirect?: string;
  redirectToLogin?: boolean;
  redirectToDashboard?: boolean;
  
  // Configuración de UI
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  accessDeniedComponent?: ReactNode;
  
  // Configuración de comportamiento
  publicPaths?: string[];
  checkSSO?: boolean;
  debugMode?: boolean;
}

// Componentes por defecto
const DefaultLoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Verificando autenticación...</p>
    </div>
  </div>
);

const DefaultAccessDeniedComponent = ({ role }: { role?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Acceso Denegado</h2>
        <p className="mt-2 text-gray-600">
          No tienes permisos para acceder a esta página.
          {role && ` Se requiere rol: ${role}`}
        </p>
      </div>
    </div>
  </div>
);

const DefaultErrorComponent = ({ error }: { error: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Error de Autenticación</h2>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    </div>
  </div>
);

export function AuthGuard({
  children,
  requireAuth = true,
  requireRole,
  allowedUserTypes,
  fallbackRedirect,
  redirectToLogin = true,
  redirectToDashboard = false,
  loadingComponent,
  errorComponent,
  accessDeniedComponent,
  publicPaths = [],
  checkSSO = true,
  debugMode = false
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, error, checkSession } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Logging helper
  const log = (message: string, data?: any) => {
    if (debugMode) {
      console.log(`[AuthGuard] ${message}`, data || '');
    }
  };

  // Verificar si la ruta actual es pública
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  );

  // Verificar SSO si está habilitado
  const checkSSOSession = async () => {
    if (!checkSSO) return;

    try {
      log('Verificando sesión SSO...');
      const hasSession = await checkSession();
      
      if (!hasSession) {
        log('No hay sesión SSO válida');
        return false;
      }
      
      log('Sesión SSO válida encontrada');
      return true;
    } catch (error) {
      log('Error verificando SSO:', error);
      return false;
    }
  };

  // Verificar autorización
  const checkAuthorization = () => {
    // Si es ruta pública, autorizar
    if (isPublicPath) {
      log('Ruta pública, autorizando acceso');
      return true;
    }

    // Si no requiere auth, autorizar
    if (!requireAuth) {
      log('No requiere autenticación, autorizando acceso');
      return true;
    }

    // Si no hay usuario, no autorizar
    if (!user) {
      log('No hay usuario autenticado');
      return false;
    }

    // Verificar rol si es requerido
    if (requireRole) {
      const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
      const hasRole = roles.includes(user.role);
      
      log('Verificando rol', { 
        requiredRoles: roles, 
        userRole: user.role, 
        hasRole 
      });
      
      if (!hasRole) {
        setAuthError(`Se requiere uno de los siguientes roles: ${roles.join(', ')}`);
        return false;
      }
    }

    // Verificar tipo de usuario si es requerido
    if (allowedUserTypes && user.userType) {
      const hasType = allowedUserTypes.includes(user.userType);
      
      log('Verificando tipo de usuario', { 
        allowedTypes: allowedUserTypes, 
        userType: user.userType, 
        hasType 
      });
      
      if (!hasType) {
        setAuthError(`Tipo de usuario no permitido: ${user.userType}`);
        return false;
      }
    }

    log('Usuario autorizado');
    return true;
  };

  // Manejar redirección
  const handleRedirect = () => {
    // Si hay un fallback específico, usarlo
    if (fallbackRedirect) {
      log('Redirigiendo a fallback:', fallbackRedirect);
      router.push(fallbackRedirect);
      return;
    }

    // Si debe redirigir al dashboard y hay usuario
    if (redirectToDashboard && user) {
      const dashboardUrl = getDashboardUrl(user.role);
      log('Redirigiendo a dashboard:', dashboardUrl);
      router.push(dashboardUrl);
      return;
    }

    // Si debe redirigir al login
    if (redirectToLogin && !user) {
      // Guardar la ruta actual para redirección post-login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }

      // Construir URL de login con parámetros
      const loginUrl = new URL('/auth/login', window.location.origin);
      loginUrl.searchParams.set('redirect', pathname);
      
      // Si hay un rol requerido, agregarlo como hint
      if (requireRole && !Array.isArray(requireRole)) {
        loginUrl.searchParams.set('role', requireRole);
      }

      log('Redirigiendo a login:', loginUrl.toString());
      router.push(loginUrl.toString());
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      log('Iniciando verificación de autenticación', { pathname });

      // Verificar SSO si está habilitado
      if (checkSSO && !loading) {
        await checkSSOSession();
      }

      // Verificar autorización
      const authorized = checkAuthorization();
      setIsAuthorized(authorized);

      // Si no está autorizado y no está cargando, manejar redirección
      if (!authorized && !loading) {
        handleRedirect();
      }
    };

    checkAuth();
  }, [user, loading, pathname]);

  // Estados de UI
  if (loading) {
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  if (error) {
    return <>{errorComponent || <DefaultErrorComponent error={error.message} />}</>;
  }

  if (authError && !isAuthorized) {
    return <>{accessDeniedComponent || <DefaultAccessDeniedComponent role={requireRole?.toString()} />}</>;
  }

  if (!isAuthorized && requireAuth) {
    // Mientras se procesa la redirección, mostrar loading
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  // Usuario autorizado, renderizar children
  return <>{children}</>;
}

// 🔒 RouteGuard - Alias para compatibilidad con código existente
export const RouteGuard = AuthGuard;

// 🛡️ ProtectedRoute - Wrapper conveniente para rutas protegidas
export function ProtectedRoute({ 
  children, 
  role,
  ...props 
}: { 
  children: ReactNode; 
  role?: UserRole;
} & Omit<AuthGuardProps, 'children' | 'requireRole'>) {
  return (
    <AuthGuard 
      requireAuth 
      requireRole={role}
      {...props}
    >
      {children}
    </AuthGuard>
  );
}

// 🔓 PublicRoute - Wrapper conveniente para rutas públicas
export function PublicRoute({ 
  children,
  ...props 
}: { 
  children: ReactNode;
} & Omit<AuthGuardProps, 'children' | 'requireAuth'>) {
  return (
    <AuthGuard 
      requireAuth={false}
      {...props}
    >
      {children}
    </AuthGuard>
  );
}