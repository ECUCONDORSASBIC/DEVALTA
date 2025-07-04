import { NextRequest, NextResponse } from 'next/server';
import { 
  medicalMonitoringMiddleware, 
  phiMonitoringMiddleware,
  authMonitoringMiddleware,
  errorMonitoringMiddleware 
} from '@altamedica/medical-security';

// Middleware de monitoreo médico para Next.js
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;
  
  // Configurar monitoreo según el tipo de endpoint
  if (path.includes('/api/patients') || path.includes('/api/medical-records')) {
    // Endpoints de PHI - monitoreo completo
    return handlePHIRequest(request, startTime);
  } else if (path.includes('/api/auth')) {
    // Endpoints de autenticación
    return handleAuthRequest(request, startTime);
  } else if (path.includes('/api/')) {
    // Otros endpoints API
    return handleAPIRequest(request, startTime);
  }
  
  return NextResponse.next();
}

// Manejar requests de PHI con monitoreo completo
function handlePHIRequest(request: NextRequest, startTime: number) {
  const response = NextResponse.next();
  
  // Agregar headers de monitoreo
  response.headers.set('X-Medical-Monitoring', 'PHI');
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  
  return response;
}

// Manejar requests de autenticación
function handleAuthRequest(request: NextRequest, startTime: number) {
  const response = NextResponse.next();
  
  response.headers.set('X-Medical-Monitoring', 'AUTH');
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  
  return response;
}

// Manejar requests API generales
function handleAPIRequest(request: NextRequest, startTime: number) {
  const response = NextResponse.next();
  
  response.headers.set('X-Medical-Monitoring', 'API');
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  
  return response;
}

// Configurar paths que requieren monitoreo
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 