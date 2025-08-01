import { NextRequest, NextResponse } from 'next/server';
import { 
  getSSOTokenFromRequest, 
  verifySSOToken, 
  validateUserRoleForApp,
  SSO_COOKIE_CONFIG
} from './sso-service';

interface SSOMiddlewareOptions {
  appName: 'patients' | 'doctors' | 'companies' | 'admin';
  publicPaths?: string[];
  loginPath?: string;
}

/**
 * SSO Middleware for all AltaMedica apps
 * Standardized authentication check across all applications
 */
export function createSSOMiddleware(options: SSOMiddlewareOptions) {
  const {
    appName,
    publicPaths = [],
    loginPath = process.env.NODE_ENV === 'production' 
      ? 'https://altamedica.com/login' 
      : 'http://localhost:3000/login'
  } = options;

  return async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check if path is public
    const isPublicPath = publicPaths.some(path => 
      pathname.startsWith(path) || pathname === path
    );

    if (isPublicPath) {
      return NextResponse.next();
    }

    // Get SSO token from cookies
    const token = getSSOTokenFromRequest(request);

    if (!token) {
      // No token, redirect to login
      return redirectToLogin(request, loginPath);
    }

    try {
      // Verify token
      const payload = await verifySSOToken(token);

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return redirectToLogin(request, loginPath, 'Token expired');
      }

      // Validate user role for this app
      if (!validateUserRoleForApp(payload.userType, appName)) {
        return NextResponse.redirect(
          new URL('/unauthorized', request.url),
          { status: 403 }
        );
      }

      // Add user info to headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.uid);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-type', payload.userType);
      requestHeaders.set('x-user-roles', JSON.stringify(payload.roles));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Invalid token, redirect to login
      return redirectToLogin(request, loginPath, 'Invalid token');
    }
  };
}

/**
 * Helper function to redirect to login with return URL
 */
function redirectToLogin(
  request: NextRequest, 
  loginPath: string,
  reason?: string
): NextResponse {
  const loginUrl = new URL(loginPath);
  
  // Add return URL
  loginUrl.searchParams.set('returnUrl', request.url);
  
  // Add reason if provided
  if (reason) {
    loginUrl.searchParams.set('reason', reason);
  }

  const response = NextResponse.redirect(loginUrl);
  
  // Clear invalid cookies
  response.cookies.delete(SSO_COOKIE_CONFIG.name);
  
  return response;
}

/**
 * Matcher configuration for Next.js middleware
 */
export const ssoMiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|public).*)',
  ],
};