/**
 * 🛡️ ALTAMEDICA - RATE LIMITING
 * Sistema de limitación de velocidad
 * Límite PROACTIVO: 150 líneas
 */
import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
}

class InMemoryRateLimit {
  private requests = new Map<string, number[]>()
  
  async check(key: string, config: RateLimitConfig): Promise<{
    success: boolean
    remaining: number
    resetTime: number
  }> {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Obtener requests para esta key
    const keyRequests = this.requests.get(key) || []
    
    // Filtrar requests dentro de la ventana de tiempo
    const validRequests = keyRequests.filter((time: any) => time > windowStart)
    
    // Limpiar requests antiguos
    this.requests.set(key, validRequests)
    
    // Verificar si excede el límite
    if (validRequests.length >= config.maxRequests) {
      const oldestRequest = Math.min(...validRequests)
      const resetTime = oldestRequest + config.windowMs
      
      return {
        success: false,
        remaining: 0,
        resetTime
      }
    }
    
    // Agregar nueva request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return {
      success: true,
      remaining: config.maxRequests - validRequests.length,
      resetTime: now + config.windowMs
    }
  }
  
  // Limpiar memoria periódicamente
  cleanup(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter((time: any) => now - time < maxAge)
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

const rateLimiter = new InMemoryRateLimit()

// Limpiar memoria cada hora
setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000)

/**
 * Configuraciones de rate limiting por endpoint
 */
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // APIs críticas - más restrictivas
  '/api/v1/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5 // 5 intentos de login por 15 min
  },
  '/api/v1/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3 // 3 registros por hora
  },
  
  // APIs normales - menos restrictivas
  '/api/v1/patients': {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100 // 100 requests por 15 min
  },
  '/api/v1/doctors': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  },
  '/api/v1/appointments': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 200
  },
  
  // Default para otros endpoints
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100 // 100 requests por 15 min
  }
}

/**
 * Generar key única para rate limiting
 */
function generateKey(request: NextRequest): string {
  // Usar IP + User-Agent como identificador
  const ip = request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const auth = request.headers.get('authorization')
  
  // Si hay token de auth, incluirlo en la key
  if (auth) {
    return `${ip}:${userAgent}:${auth.substring(0, 20)}`
  }
  
  return `${ip}:${userAgent}`
}

/**
 * Rate limiting principal
 */
export default async function rateLimit(request: NextRequest): Promise<{
  success: boolean
  remaining?: number
  resetTime?: number
  error?: string
}> {
  try {
    const pathname = new URL(request.url).pathname
    
    // Buscar configuración específica para el endpoint
    let config = RATE_LIMIT_CONFIGS[pathname]
    
    // Si no hay configuración específica, buscar por patrón
    if (!config) {
      for (const [pattern, patternConfig] of Object.entries(RATE_LIMIT_CONFIGS)) {
        if (pathname.startsWith(pattern)) {
          config = patternConfig
          break
        }
      }
    }
    
    // Usar configuración por defecto si no se encuentra
    if (!config) {
      config = RATE_LIMIT_CONFIGS.default
    }
    
    // Generar key única
    const key = generateKey(request)
    
    // Verificar rate limit
    const result = await rateLimiter.check(key, config)
    
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: result.resetTime,
      error: result.success ? undefined : 'Rate limit exceeded'
    }
  } catch (error: unknown) {
    console.error('Error en rate limiting:', error)
    // En caso de error, permitir la request
    return { success: true }
  }
}
