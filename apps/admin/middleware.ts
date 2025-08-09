import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas públicas mínimas (login local eliminado: redirigido a web-app)
const publicRoutes = ['/api/health']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bloquear intento de uso de /login local → redirigir a gateway central
  if (pathname.startsWith('/login')) {
    const central = new URL('http://localhost:3000/auth/login')
    central.searchParams.set('from', 'admin')
    return NextResponse.redirect(central)
  }
  if (publicRoutes.some(route => pathname.startsWith(route))) return NextResponse.next()

  // Verificar token de autenticación
  const token = request.cookies.get('adminToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Si no hay token, redirigir al login
  if (!token) {
  const central = new URL('http://localhost:3000/auth/login')
  central.searchParams.set('from', 'admin')
  central.searchParams.set('redirect', pathname)
  return NextResponse.redirect(central)
  }

  // TODO: Validar token con el backend
  // Por ahora, simplemente verificamos que existe
  
  // Si el usuario está autenticado y trata de acceder a la raíz, redirigir al dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}