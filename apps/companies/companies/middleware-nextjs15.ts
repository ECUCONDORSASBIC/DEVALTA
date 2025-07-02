import type { NextRequest } from 'next/server'
import { unstable_after as after, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Headers de seguridad adicionales para la app de empresas
  const response = NextResponse.next()
  
  // Headers específicos para aplicaciones empresariales
  response.headers.set('X-Medical-App', 'companies')
  response.headers.set('X-Enterprise-Portal', 'true')
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  
  // Verificación de rutas empresariales protegidas
  const isEnterpriseRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/employees') ||
                           request.nextUrl.pathname.startsWith('/health-plans') ||
                           request.nextUrl.pathname.startsWith('/reports')
  
  if (isEnterpriseRoute) {
    // Aquí se integrará Firebase Auth con roles empresariales más tarde
    response.headers.set('X-Enterprise-Route', 'true')
    response.headers.set('X-Requires-Company-Access', 'true')
  }
  
  // Headers específicos para contenido público (servicios, información)
  const isPublicRoute = request.nextUrl.pathname.startsWith('/services') ||
                       request.nextUrl.pathname.startsWith('/about') ||
                       request.nextUrl.pathname === '/'
  
  if (isPublicRoute) {
    response.headers.set('X-Public-Content', 'true')
    response.headers.set('Cache-Control', 'public, max-age=1800') // Cache para contenido público
  }
  
  // Geolocalización para servicios empresariales
  const country = request.geo?.country || 'unknown'
  response.headers.set('X-User-Country', country)
  
  // Logging de auditoría usando unstable_after (Next.js 15.3.3)
  // Esto ejecuta el logging DESPUÉS de enviar la respuesta al cliente
  after(async () => {
    try {
      const auditData = {
        timestamp: new Date().toISOString(),
        method: request.method,
        pathname: request.nextUrl.pathname,
        ip: request.ip || 'unknown',
        country,
        userAgent: request.headers.get('user-agent') || 'unknown',
        isEnterpriseRoute,
        isPublicRoute,
        referrer: request.headers.get('referer') || 'direct'
      }
      
      if (process.env.NODE_ENV === 'production') {
        // En producción, enviar a sistema de auditoría
        console.log(`[ENTERPRISE-AUDIT-NEXTJS-15.3.3] ${JSON.stringify(auditData)}`)
        
        // Aquí podrías enviar a servicios externos como:
        // - Base de datos de auditoría
        // - Servicio de monitoreo
        // - Analytics médicos HIPAA-compliant
        
        // Ejemplo de envío a API de auditoría (opcional)
        if (process.env.AUDIT_API_ENDPOINT) {
          await fetch(process.env.AUDIT_API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.AUDIT_API_TOKEN}`
            },
            body: JSON.stringify(auditData)
          }).catch(error => {
            console.error('[AUDIT-ERROR]', error)
          })
        }
      } else {
        // En desarrollo, logging simplificado
        console.log(`[DEV-AUDIT] ${request.method} ${request.nextUrl.pathname}`)
      }
    } catch (error) {
      console.error('[AUDIT-AFTER-ERROR]', error)
    }
  })
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
