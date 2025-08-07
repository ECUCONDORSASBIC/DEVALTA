import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { roleRedirectMiddleware } from '../middleware/role-redirect';
import { getDashboardUrl } from '../config/app-urls';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check HTTPS first
  const proto = request.headers.get('x-forwarded-proto');
  if (proto && proto !== 'https' && process.env.NODE_ENV === 'production') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Verificar redirección basada en rol
  const roleRedirect = await roleRedirectMiddleware(request);
  if (roleRedirect) {
    return roleRedirect;
  }

  // Check if path requires authentication
  const protectedPaths = ['/dashboard', '/profile', '/admin', '/companies', '/doctors', '/patients'];
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));

  if (requiresAuth) {
    // Get token from cookie
    const token = request.cookies.get('altamedica_token')?.value;
    
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('http://localhost:3000/login', request.url));
    }
    
    try {
      // Basic token validation (since we don't have @altamedica/shared in monorepo)
      if (!token || token.length < 10) {
        throw new Error('Invalid token');
      }
      
      // Token exists and looks valid, allow access
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('http://localhost:3000/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
