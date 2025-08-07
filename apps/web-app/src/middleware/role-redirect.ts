import { NextRequest, NextResponse } from 'next/server';
import { getDashboardUrl } from '../config/app-urls';

/**
 * Middleware para redirigir usuarios a su aplicación correspondiente según su rol
 */
export async function roleRedirectMiddleware(request: NextRequest) {
  // Obtener el token de autenticación
  const authToken = request.cookies.get('auth-token')?.value;
  
  if (!authToken) {
    return null; // No hay token, dejar que pase
  }
  
  try {
    // Decodificar el token para obtener el rol del usuario
    // Nota: En producción, esto debería validarse con una clave secreta
    const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
    const userRole = tokenPayload.role;
    const currentPath = request.nextUrl.pathname;
    
    // Rutas que requieren redirección según rol
    const protectedPaths = ['/dashboard', '/profile', '/appointments', '/settings'];
    const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
    
    // Si el usuario no es paciente y está en una ruta protegida de web-app
    if (isProtectedPath && userRole && userRole !== 'patient') {
      const targetUrl = getDashboardUrl(userRole);
      
      // Si la URL objetivo es diferente del origen actual, redirigir
      if (targetUrl.startsWith('http')) {
        return NextResponse.redirect(new URL(targetUrl));
      }
    }
    
    // Verificar si un usuario paciente intenta acceder a rutas de otros roles
    if (userRole === 'patient' && currentPath.includes('/admin')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
  } catch (error) {
    console.error('Error procesando token en middleware:', error);
    // En caso de error, dejar que la aplicación maneje la autenticación
  }
  
  return null;
}

/**
 * Configuración de rutas para el middleware
 */
export const roleRedirectConfig = {
  matcher: [
    // Incluir rutas protegidas
    '/dashboard/:path*',
    '/profile/:path*',
    '/appointments/:path*',
    '/settings/:path*',
    // Excluir archivos estáticos y API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};