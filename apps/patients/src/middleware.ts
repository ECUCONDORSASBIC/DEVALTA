import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
];

// Rutas que requieren perfil completo
const PROFILE_REQUIRED_PATHS = [
  '/appointments',
  '/telemedicine',
  '/medical-records',
  '/prescriptions',
];

// Rutas de API que no requieren autenticación
const PUBLIC_API_PATHS = [
  '/api/health',
  '/api/public',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir acceso a archivos estáticos y recursos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar tokens de autenticación
  const accessToken = request.cookies.get('altamedica_access_token');
  const userCookie = request.cookies.get('altamedica_user');
  
  // Parser del usuario si existe
  let user = null;
  if (userCookie?.value) {
    try {
      user = JSON.parse(userCookie.value);
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
  }

  // Verificar si es una ruta pública
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const isPublicAPI = PUBLIC_API_PATHS.some(path => pathname.startsWith(path));
  
  if (isPublicPath || isPublicAPI) {
    // Si el usuario está autenticado y trata de acceder a login/register, redirigir a dashboard
    if (accessToken && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Si no hay token, redirigir a login
  if (!accessToken) {
    const url = new URL('/login', request.url);
    // Guardar la URL original para redirigir después del login
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Verificar rol de paciente
  if (user && user.role !== 'patient') {
    // Si no es un paciente, redirigir a la app correcta
    const roleRedirectMap: Record<string, string> = {
      'doctor': 'http://localhost:3002',
      'company-admin': 'http://localhost:3004',
      'platform-admin': 'http://localhost:3005',
    };

    const redirectUrl = roleRedirectMap[user.role];
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }
    
    // Si el rol no está mapeado, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar si el perfil está completo para rutas que lo requieren
  const requiresProfile = PROFILE_REQUIRED_PATHS.some(path => pathname.startsWith(path));
  if (requiresProfile && user && !user.profileComplete) {
    // Si el perfil no está completo, redirigir a onboarding
    if (pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Agregar headers de seguridad
  const response = NextResponse.next();
  
  // Headers de seguridad HIPAA
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.mercadopago.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3001 ws://localhost:8888 https://api.mercadopago.com;"
  );
  
  // Header para indicar que es una app médica con datos sensibles
  response.headers.set('X-Medical-App', 'true');
  response.headers.set('X-HIPAA-Compliant', 'true');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/health (health checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|public).*)',
  ],
};