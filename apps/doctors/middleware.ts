import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@altamedica/shared';

export function middleware(request: NextRequest) {
  // Check HTTPS first
  const proto = request.headers.get('x-forwarded-proto');
  if (proto && proto !== 'https' && process.env.NODE_ENV === 'production') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Check if path requires authentication
  const { pathname } = request.nextUrl;
  const protectedPaths = ['/dashboard', '/profile', '/patients', '/appointments', '/telemedicine'];
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));

  if (requiresAuth) {
    // Get token from cookie
    const token = request.cookies.get('altamedica_token')?.value;
    
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('http://localhost:3000/login', request.url));
    }
    
    try {
      // Verify token
      const decoded = verifyAuthToken(token);
      
      // Check if user type is doctor
      if (decoded.userType !== 'doctor') {
        return NextResponse.redirect(new URL('http://localhost:3000/login', request.url));
      }
      
      // Add user info to headers for the next handler
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.uid);
      requestHeaders.set('x-user-email', decoded.email);
      requestHeaders.set('x-user-type', decoded.userType);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
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
