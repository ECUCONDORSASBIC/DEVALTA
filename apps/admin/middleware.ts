import { createSSOMiddleware } from '@altamedica/auth'
import type { NextRequest } from 'next/server'

// SSO centralizado para Admin (estricto)
const sso = createSSOMiddleware({
  appName: 'admin',
  allowedRoles: ['admin', 'superadmin'],
  loginUrl: process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:3000/auth/login',
  apiUrl: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify`
    : 'http://localhost:3001/api/v1/auth/verify',
  publicPaths: ['/api/health', '/_next', '/favicon.ico', '/icons', '/images', '/robots.txt', '/sitemap.xml'],
  debug: process.env.NODE_ENV === 'development',
})

export async function middleware(request: NextRequest) {
  return sso(request)
}

export { ssoMiddlewareConfig as config } from '@altamedica/auth'
