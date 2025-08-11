/**
 * 🔐 Auth Guard Middleware
 * Protege las rutas de las aplicaciones Next.js
 * Verifica cookies httpOnly y redirige si no está autenticado
 */

import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIES, LEGACY_AUTH_COOKIES } from '../constants/cookies';

interface AuthConfig {
  loginUrl?: string;
  apiUrl?: string;
  allowedRoles?: string[];
}

const DEFAULT_CONFIG: AuthConfig = {
  loginUrl: 'http://localhost:3000/login',
  apiUrl: 'http://localhost:3008/api/v1/auth/verify'
};

export async function authGuard(
  request: NextRequest,
  config: AuthConfig = {}
): Promise<NextResponse | null> {
  const { loginUrl, apiUrl, allowedRoles } = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // 1. Obtener cookies de la request (nuevo estándar + fallback legacy)
    const authToken =
      request.cookies.get(AUTH_COOKIES.token) ||
      request.cookies.get(LEGACY_AUTH_COOKIES.token);
    const refreshToken =
      request.cookies.get(AUTH_COOKIES.refresh) ||
      request.cookies.get(LEGACY_AUTH_COOKIES.refresh);
    
    // 2. Si no hay cookies, redirigir a login
    if (!authToken && !refreshToken) {
      console.log('[AuthGuard] No auth cookies found, redirecting to login');
      return NextResponse.redirect(new URL(loginUrl!));
    }
    
    // 3. Verificar token con el API server
    const verifyResponse = await fetch(apiUrl!, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    // 4. Si el token es inválido, redirigir a login
    if (!verifyResponse.ok) {
      console.log('[AuthGuard] Token verification failed, redirecting to login');
      return NextResponse.redirect(new URL(loginUrl!));
    }
    
    const { user } = await verifyResponse.json();
    
    // 5. Verificar rol si es necesario
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        console.log(`[AuthGuard] User role ${user.role} not allowed, need one of: ${allowedRoles.join(', ')}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
    
    // 6. Agregar información del usuario a los headers
    const response = NextResponse.next();
    response.headers.set('X-User-Id', user.uid);
    response.headers.set('X-User-Role', user.role);
    response.headers.set('X-User-Email', user.email || '');
    
    // 7. Si hay una nueva cookie de auth (renovación), pasarla
    const setCookieHeader = verifyResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }
    
    return null; // Permitir acceso
    
  } catch (error) {
    console.error('[AuthGuard] Error:', error);
    // En caso de error, redirigir a login por seguridad
    return NextResponse.redirect(new URL(loginUrl!));
  }
}

/**
 * Middleware para Next.js
 * Usar en middleware.ts de cada aplicación
 */
export function createAuthMiddleware(config: AuthConfig = {}) {
  return async function middleware(request: NextRequest) {
    // Rutas que NO requieren autenticación
    const publicPaths = [
      '/login',
      '/register',
      '/forgot-password',
      '/api/health',
      '/_next',
      '/favicon.ico',
      '/public'
    ];
    
    // Verificar si es una ruta pública
    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );
    
    if (isPublicPath) {
      return NextResponse.next();
    }
    
    // Aplicar auth guard
    const authResponse = await authGuard(request, config);
    
    // Si authGuard retorna una respuesta (redirect), usarla
    if (authResponse) {
      return authResponse;
    }
    
    // Si no hay respuesta, permitir acceso
    return NextResponse.next();
  };
}