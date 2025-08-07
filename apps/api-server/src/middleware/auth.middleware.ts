import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, UserRole, AuthToken, createAuthContext } from '../lib/auth';

// Configuración de rutas y sus permisos
export const routePermissions: Record<string, { roles?: UserRole[]; permissions?: string[]; public?: boolean }> = {
  // Rutas públicas
  '/api/v1/auth/login': { public: true },
  '/api/v1/auth/register': { public: true },
  '/api/v1/auth/refresh': { public: true },
  '/api/health': { public: true },
  
  // Rutas de autenticación (requieren token válido)
  '/api/v1/auth/logout': { roles: Object.values(UserRole) as UserRole[] },
  '/api/v1/auth/me': { roles: Object.values(UserRole) as UserRole[] },
  
  // Rutas de administración
  '/api/v1/admin': { roles: [UserRole.ADMIN] },
  '/api/v1/users': { roles: [UserRole.ADMIN], permissions: ['users:manage'] },
  '/api/v1/settings': { roles: [UserRole.ADMIN], permissions: ['settings:manage'] },
  
  // Rutas de doctores
  '/api/v1/doctors': { roles: [UserRole.DOCTOR, UserRole.ADMIN] },
  '/api/v1/appointments/doctor': { roles: [UserRole.DOCTOR] },
  '/api/v1/prescriptions/create': { roles: [UserRole.DOCTOR], permissions: ['prescriptions:write'] },
  
  // Rutas de pacientes
  '/api/v1/patients': { roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN] },
  '/api/v1/appointments/patient': { roles: [UserRole.PATIENT] },
  '/api/v1/medical-records': { roles: [UserRole.PATIENT, UserRole.DOCTOR], permissions: ['medical:read'] },
  
  // Rutas de empresas
  '/api/v1/companies': { roles: [UserRole.COMPANY, UserRole.ADMIN] },
  '/api/v1/marketplace': { roles: [UserRole.COMPANY, UserRole.DOCTOR] },
  
  // Rutas de telemedicina
  '/api/v1/telemedicine': { roles: [UserRole.PATIENT, UserRole.DOCTOR] },
  '/api/v1/webrtc': { roles: [UserRole.PATIENT, UserRole.DOCTOR] },
};

// Middleware principal de autenticación
export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Encontrar configuración de permisos para la ruta
  const routeConfig = findRouteConfig(pathname);
  
  // Si la ruta es pública, permitir acceso
  if (routeConfig?.public) {
    return NextResponse.next();
  }
  
  // Verificar autenticación
  const { isValid, user } = await verifyAuth(request);
  
  // Si no hay autenticación válida, retornar 401
  if (!isValid || !user) {
    return createUnauthorizedResponse('Authentication required');
  }
  
  // Crear contexto de autenticación
  const authContext = createAuthContext(user);
  
  // Verificar roles si están configurados
  if (routeConfig?.roles && routeConfig.roles.length > 0) {
    const hasRequiredRole = routeConfig.roles.some(role => authContext.hasRole(role));
    
    if (!hasRequiredRole) {
      return createForbiddenResponse('Insufficient role privileges');
    }
  }
  
  // Verificar permisos específicos si están configurados
  if (routeConfig?.permissions && routeConfig.permissions.length > 0) {
    const hasRequiredPermissions = routeConfig.permissions.every(permission => 
      authContext.hasPermission(permission)
    );
    
    if (!hasRequiredPermissions) {
      return createForbiddenResponse('Insufficient permissions');
    }
  }
  
  // Agregar información del usuario al header para que esté disponible en las rutas
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.userId);
  response.headers.set('x-user-email', user.email);
  response.headers.set('x-user-role', user.role);
  
  return response;
}

// Middleware de roles específico (para uso en rutas individuales)
export function requireRole(...allowedRoles: UserRole[]) {
  return async (request: NextRequest) => {
    const { isValid, user } = await verifyAuth(request);
    
    if (!isValid || !user) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    if (!allowedRoles.includes(user.role)) {
      return createForbiddenResponse(`Role ${user.role} not allowed. Required: ${allowedRoles.join(', ')}`);
    }
    
    return null; // Continuar con el handler
  };
}

// Middleware de permisos específico
export function requirePermission(...requiredPermissions: string[]) {
  return async (request: NextRequest) => {
    const { isValid, user } = await verifyAuth(request);
    
    if (!isValid || !user) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    const authContext = createAuthContext(user);
    const hasAllPermissions = requiredPermissions.every(permission => 
      authContext.hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return createForbiddenResponse(`Missing permissions: ${requiredPermissions.join(', ')}`);
    }
    
    return null; // Continuar con el handler
  };
}

// Helper para encontrar configuración de ruta
function findRouteConfig(pathname: string) {
  // Buscar coincidencia exacta
  if (routePermissions[pathname]) {
    return routePermissions[pathname];
  }
  
  // Buscar coincidencia por prefijo
  const matchingRoute = Object.keys(routePermissions).find(route => {
    // Convertir ruta a regex para manejar parámetros dinámicos
    const routePattern = route.replace(/\[([^\]]+)\]/g, '([^/]+)');
    const regex = new RegExp(`^${routePattern}`);
    return regex.test(pathname);
  });
  
  return matchingRoute ? routePermissions[matchingRoute] : null;
}

// Helper para crear respuesta 401
function createUnauthorizedResponse(message: string) {
  return NextResponse.json(
    { 
      error: 'Unauthorized',
      message,
      statusCode: 401
    },
    { status: 401 }
  );
}

// Helper para crear respuesta 403
function createForbiddenResponse(message: string) {
  return NextResponse.json(
    { 
      error: 'Forbidden',
      message,
      statusCode: 403
    },
    { status: 403 }
  );
}

// Wrapper para rutas API con autenticación
export function withAuth(
  handler: (request: NextRequest, context: { user: AuthToken }) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { isValid, user } = await verifyAuth(request);
    
    if (!isValid || !user) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    return handler(request, { user });
  };
}

// Wrapper para rutas API con roles específicos
export function withRole(
  roles: UserRole[],
  handler: (request: NextRequest, context: { user: AuthToken }) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { isValid, user } = await verifyAuth(request);
    
    if (!isValid || !user) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    if (!roles.includes(user.role)) {
      return createForbiddenResponse(`Role ${user.role} not allowed`);
    }
    
    return handler(request, { user });
  };
}