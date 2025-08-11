/**
 * 🔐 SSO Middleware for AltaMedica Platform
 * Unified authentication middleware for all Next.js applications
 * Handles SSO, role-based redirects, and HIPAA compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIES, LEGACY_AUTH_COOKIES } from '../constants/cookies';

// Port mappings for role-based redirects
const ROLE_PORTS = {
  PATIENT: 3003,
  DOCTOR: 3002,
  COMPANY: 3004,
  ADMIN: 3005,
} as const;

export interface SSOConfig {
  /** Current app name for logging */
  appName: string;
  /** Required roles for this app (empty = any authenticated user) */
  allowedRoles?: string[];
  /** Custom login URL (defaults to SSO gateway) */
  loginUrl?: string;
  /** API server URL for token verification */
  apiUrl?: string;
  /** Public paths that don't require auth */
  publicPaths?: string[];
  /** Enable debug logging */
  debug?: boolean;
  /** Custom unauthorized redirect */
  unauthorizedUrl?: string;
  /** Enable CORS for cross-origin requests */
  enableCORS?: boolean;
  /** Allowed origins for CORS */
  allowedOrigins?: string[];
}

const DEFAULT_CONFIG: Partial<SSOConfig> = {
  loginUrl: process.env.NEXT_PUBLIC_SSO_URL || 'http://localhost:3000/login',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1/auth/verify',
  publicPaths: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/public',
    '/images',
    '/fonts',
  ],
  unauthorizedUrl: '/unauthorized',
  debug: process.env.NODE_ENV === 'development',
  enableCORS: true,
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
  ],
};

/**
 * Creates SSO middleware for Next.js applications
 */
export function createSSOMiddleware(config: SSOConfig) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { appName, debug } = finalConfig;

  return async function middleware(request: NextRequest) {
    const log = (message: string, ...args: any[]) => {
      if (debug) console.log(`[SSO:${appName}] ${message}`, ...args);
    };

    log('Processing request:', request.nextUrl.pathname);

    // 1. Check if path is public
    const isPublicPath = finalConfig.publicPaths?.some(path =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (isPublicPath) {
      log('Public path, allowing access');
      return addSecurityHeaders(NextResponse.next(), finalConfig);
    }

    // 2. Check authentication
    const authResult = await verifyAuthentication(request, finalConfig, log);

    if (!authResult.isAuthenticated) {
      log('Not authenticated, redirecting to login');
      const loginUrl = new URL(finalConfig.loginUrl!);
      loginUrl.searchParams.set('redirect', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Check role authorization
    if (finalConfig.allowedRoles && finalConfig.allowedRoles.length > 0) {
      if (!finalConfig.allowedRoles.includes(authResult.user!.role)) {
        log(`User role ${authResult.user!.role} not allowed`);
        
        // Try to redirect to appropriate app based on role
        const roleRedirect = getRoleBasedRedirect(authResult.user!.role, request);
        if (roleRedirect) {
          log(`Redirecting to ${roleRedirect}`);
          return NextResponse.redirect(new URL(roleRedirect));
        }

        // Otherwise show unauthorized
        return NextResponse.redirect(
          new URL(finalConfig.unauthorizedUrl!, request.url)
        );
      }
    }

    // 4. Create response with user context
    const response = NextResponse.next();
    
    // Add user info to headers for server components
    response.headers.set('X-User-Id', authResult.user!.uid);
    response.headers.set('X-User-Role', authResult.user!.role);
    response.headers.set('X-User-Email', authResult.user!.email || '');

    // 5. Handle cookie refresh if needed
    if (authResult.setCookie) {
      response.headers.set('set-cookie', authResult.setCookie);
    }

    // 6. Add security headers
    return addSecurityHeaders(response, finalConfig);
  };
}

/**
 * Verifies authentication with the API server
 */
async function verifyAuthentication(
  request: NextRequest,
  config: Partial<SSOConfig>,
  log: (message: string, ...args: any[]) => void
): Promise<{
  isAuthenticated: boolean;
  user?: { uid: string; role: string; email?: string };
  setCookie?: string;
}> {
  try {
    // Get auth cookies (check both new and legacy names)
    const authToken =
      request.cookies.get(AUTH_COOKIES.token)?.value ||
      request.cookies.get(LEGACY_AUTH_COOKIES.token)?.value;
    
    const refreshToken =
      request.cookies.get(AUTH_COOKIES.refresh)?.value ||
      request.cookies.get(LEGACY_AUTH_COOKIES.refresh)?.value;

    if (!authToken && !refreshToken) {
      log('No auth cookies found');
      return { isAuthenticated: false };
    }

    // Verify with API server
    const verifyResponse = await fetch(config.apiUrl!, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.ip || '',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      credentials: 'include',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

    if (!verifyResponse.ok) {
      log('Token verification failed:', verifyResponse.status);
      return { isAuthenticated: false };
    }

    const data = await verifyResponse.json();
    
    return {
      isAuthenticated: true,
      user: data.user,
      setCookie: verifyResponse.headers.get('set-cookie') || undefined,
    };
  } catch (error) {
    log('Error verifying authentication:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Gets role-based redirect URL
 */
function getRoleBasedRedirect(role: string, request: NextRequest): string | null {
  const port = ROLE_PORTS[role as keyof typeof ROLE_PORTS];
  if (!port) return null;

  // In production, use subdomains or paths instead of ports
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    const url = new URL(request.url);
    url.port = port.toString();
    url.pathname = '/';
    return url.toString();
  } else {
    // Production URLs (customize based on your setup)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://altamedica.com';
    const roleUrls: Record<string, string> = {
      PATIENT: `${baseUrl}/patients`,
      DOCTOR: `${baseUrl}/doctors`,
      COMPANY: `${baseUrl}/companies`,
      ADMIN: `${baseUrl}/admin`,
    };
    return roleUrls[role] || null;
  }
}

/**
 * Adds security headers to response
 */
function addSecurityHeaders(
  response: NextResponse,
  config: Partial<SSOConfig>
): NextResponse {
  // CORS headers if enabled
  if (config.enableCORS && config.allowedOrigins) {
    const origin = response.headers.get('origin');
    if (origin && config.allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
  }

  // Security headers (these will be complemented by next.config.js)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * Middleware configuration for Next.js
 * Export this from your middleware.ts file
 */
export const ssoMiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};