import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware unificado: bloquear cualquier /login local y redirigir al gateway
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/login')) {
    const url = new URL('http://localhost:3000/auth/login')
    url.searchParams.set('from', 'patients')
    if (pathname !== '/login') url.searchParams.set('path', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/login', '/login/:path*'] }