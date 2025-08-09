import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🏥 AltaMedica Security Middleware
 * Middleware de seguridad HIPAA para protección de rutas médicas
 */

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/medical',
  '/patients',
  '/appointments',
  '/anamnesis',
  '/patient3d'
];

// Rutas de autenticación
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
];

// Rutas públicas permitidas
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/pricing',
  '/privacy',
  '/terms',
  '/help',
  '/anamnesis-demo',
  '/hospital3d'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // 🛡️ SECURITY HEADERS HIPAA
  // Aplicar headers de seguridad a todas las rutas
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(*), microphone=(*), geolocation=(self)');
  
  // Headers específicos para rutas médicas
  if (isProtectedRoute(pathname)) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  // 🔐 AUTENTICACIÓN Y AUTORIZACIÓN
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = !!token; // Simplificado - en producción verificar JWT
  
  // Redirigir rutas protegidas si no está autenticado
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirigir rutas de auth si ya está autenticado
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 📊 AUDIT LOGGING
  // Log acceso a rutas médicas sensibles
  if (isProtectedRoute(pathname)) {
    logMedicalAccess(request, pathname);
  }
  
  // 🚫 RATE LIMITING BÁSICO
  // En producción usar Redis o similar
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  if (shouldRateLimit(clientIP, pathname)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  return response;
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

function logMedicalAccess(request: NextRequest, pathname: string) {
  // En producción: enviar a sistema de audit logging
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  console.log(`[MEDICAL_ACCESS] ${timestamp} - IP: ${ip} - Path: ${pathname} - UA: ${userAgent}`);
  
  // TODO: Implementar logging a base de datos para compliance HIPAA
  // await logToDatabase({
  //   timestamp,
  //   ip,
  //   pathname,
  //   userAgent,
  //   action: 'ROUTE_ACCESS',
  //   riskLevel: isHighRiskRoute(pathname) ? 'HIGH' : 'MEDIUM'
  // });
}

function shouldRateLimit(clientIP: string, pathname: string): boolean {
  // Rate limiting básico - en producción usar Redis
  // Limitar rutas de autenticación más estrictamente
  if (isAuthRoute(pathname)) {
    // Máximo 5 intentos de login por minuto por IP
    return false; // Implementar lógica real de rate limiting
  }
  
  // Limitar APIs médicas
  if (pathname.startsWith('/api/')) {
    // Máximo 100 requests por minuto para APIs médicas
    return false; // Implementar lógica real de rate limiting
  }
  
  return false;
}

function isHighRiskRoute(pathname: string): boolean {
  const highRiskRoutes = [
    '/patients',
    '/medical',
    '/anamnesis',
    '/patient3d'
  ];
  
  return highRiskRoutes.some(route => pathname.startsWith(route));
}

// Configuración del matcher
export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - API routes internas de Next.js
     * - Archivos estáticos
     * - Favicon y otros assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)',
  ],
};