import type { NextRequest } from 'next/server'
import { createSSOMiddleware } from '@altamedica/auth'

// SSO centralizado para Patients
const sso = createSSOMiddleware({
  appName: 'patients',
  allowedRoles: ['patient'],
  loginUrl: process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:3000/auth/login',
  apiUrl: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify`
    : 'http://localhost:3001/api/v1/auth/verify',
  publicPaths: [
    '/_next', '/favicon.ico', '/icons', '/images', '/robots.txt', '/sitemap.xml', '/api/health',
    '/auth/login', '/auth/register', '/auth/forgot-password'
  ],
  debug: process.env.NODE_ENV === 'development',
})

export async function middleware(request: NextRequest) {
  return sso(request)
}

// Exporta matcher y config del paquete auth
export { ssoMiddlewareConfig as config } from '@altamedica/auth'