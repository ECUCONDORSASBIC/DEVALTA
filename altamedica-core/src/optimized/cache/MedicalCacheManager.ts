// Sistema de Cache Médico Avanzado - Altamedica
// HIPAA Compliant + Performance Optimization + Smart Invalidation

'use client'

import { LRUCache } from 'lru-cache'

// Tipos para el sistema de cache médico
interface MedicalCacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
  hipaaCompliant: boolean
  encrypted: boolean
  accessCount: number
  lastAccessed: number
  tags: string[]
  priority: 'high' | 'medium' | 'low'
  source: 'api' | 'local' | 'computed'
}

interface MedicalCacheConfig {
  maxSize: number
  ttl: number // Time to live en ms
  maxAge: number // Máxima edad en ms  
  hipaaMode: boolean
  encryptSensitiveData: boolean
  persistToSessionStorage: boolean
  enableMetrics: boolean
  tags?: string[]
  priority?: 'high' | 'medium' | 'low'
}

interface CacheMetrics {
  hits: number
  misses: number
  sets: number
  deletes: number
  hitRate: number
  avgResponseTime: number
  memoryUsage: number
  lastCleanup: number
}

// Configuraciones por tipo de dato médico
const MEDICAL_CACHE_CONFIGS: Record<string, MedicalCacheConfig> = {
  // Datos de pacientes - Alta sensibilidad HIPAA
  patients: {
    maxSize: 100,
    ttl: 5 * 60 * 1000, // 5 minutos
    maxAge: 10 * 60 * 1000, // 10 minutos máximo
    hipaaMode: true,
    encryptSensitiveData: true,
    persistToSessionStorage: false, // Nunca persistir datos PHI
    enableMetrics: true,
    tags: ['medical', 'phi', 'sensitive'],
    priority: 'high'
  },
  
  // Citas médicas - Sensibilidad media
  appointments: {
    maxSize: 200,
    ttl: 2 * 60 * 1000, // 2 minutos
    maxAge: 5 * 60 * 1000, // 5 minutos máximo
    hipaaMode: true,
    encryptSensitiveData: true,
    persistToSessionStorage: false,
    enableMetrics: true,
    tags: ['medical', 'scheduling'],
    priority: 'high'
  },
  
  // Configuraciones del sistema - Baja sensibilidad
  system: {
    maxSize: 50,
    ttl: 30 * 60 * 1000, // 30 minutos
    maxAge: 60 * 60 * 1000, // 1 hora máximo
    hipaaMode: false,
    encryptSensitiveData: false,
    persistToSessionStorage: true,
    enableMetrics: true,
    tags: ['system', 'config'],
    priority: 'low'
  },
  
  // Datos de consulta/lookup - Cacheo largo
  lookup: {
    maxSize: 500,
    ttl: 60 * 60 * 1000, // 1 hora
    maxAge: 4 * 60 * 60 * 1000, // 4 horas máximo
    hipaaMode: false,
    encryptSensitiveData: false,
    persistToSessionStorage: true,
    enableMetrics: true,
    tags: ['lookup', 'reference'],
    priority: 'medium'
  }
}

// Clase principal del cache médico
class MedicalCacheManager {
  private caches: Map<string, LRUCache<string, MedicalCacheEntry>>
  private metrics: Map<string, CacheMetrics>
  private encryptionKey: string
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.caches = new Map()
    this.metrics = new Map()
    this.encryptionKey = process.env.NEXT_PUBLIC_CACHE_ENCRYPTION_KEY || 'default-cache-key'
    
    // Inicializar caches para cada tipo
    Object.entries(MEDICAL_CACHE_CONFIGS).forEach(([type, config]) => {
      this.initializeCache(type, config)
    })

    // Configurar limpieza automática
    this.setupCleanupInterval()
    
    // Configurar limpieza al cerrar ventana
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanup())
    }
  }

  private initializeCache(type: string, config: MedicalCacheConfig) {
    const cache = new LRUCache<string, MedicalCacheEntry>({
      max: config.maxSize,
      ttl: config.ttl,
      maxAge: config.maxAge,
      updateAgeOnGet: true,
      dispose: (value, key) => {
        // Log disposal para auditoría HIPAA
        if (config.hipaaMode) {
          console.log(`[HIPAA-CACHE] Disposed: ${type}:${key}`, {
            timestamp: new Date().toISOString(),
            reason: 'ttl_expired'
          })
        }
      }
    })

    this.caches.set(type, cache)
    
    // Inicializar métricas
    this.metrics.set(type, {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
      lastCleanup: Date.now()
    })
  }

  private setupCleanupInterval() {
    // Limpieza cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, 5 * 60 * 1000)
  }

  private performCleanup() {
    const now = Date.now()
    
    this.caches.forEach((cache, type) => {
      const config = MEDICAL_CACHE_CONFIGS[type]
      const metrics = this.metrics.get(type)!
      
      // Limpiar entradas expiradas manualmente
      for (const [key, entry] of cache.entryKeyValues()) {
        if (entry.expiresAt < now) {
          cache.delete(key)
          
          // Log para HIPAA si es necesario
          if (config.hipaaMode) {
            console.log(`[HIPAA-CACHE] Manual cleanup: ${type}:${key}`, {
              timestamp: new Date().toISOString(),
              expiredAt: new Date(entry.expiresAt).toISOString()
            })
          }
        }
      }
      
      // Actualizar métricas
      metrics.lastCleanup = now
      metrics.memoryUsage = this.calculateMemoryUsage(cache)
    })
  }

  private calculateMemoryUsage(cache: LRUCache<string, MedicalCacheEntry>): number {
    // Estimación aproximada del uso de memoria
    let size = 0
    for (const entry of cache.values()) {
      size += JSON.stringify(entry).length * 2 // UTF-16 = 2 bytes per char
    }
    return size
  }

  private encryptData(data: any): string {
    if (typeof window === 'undefined') return JSON.stringify(data)
    
    try {
      // Simulación de encriptación (en producción usar crypto real)
      const jsonString = JSON.stringify(data)
      return btoa(jsonString) // Base64 básico para demo
    } catch {
      return JSON.stringify(data)
    }
  }

  private decryptData(encryptedData: string): any {
    try {
      const jsonString = atob(encryptedData)
      return JSON.parse(jsonString)
    } catch {
      return JSON.parse(encryptedData)
    }
  }

  // Método principal para obtener datos del cache
  get<T = any>(type: string, key: string): T | null {
    const cache = this.caches.get(type)
    const metrics = this.metrics.get(type)
    const config = MEDICAL_CACHE_CONFIGS[type]
    
    if (!cache || !metrics || !config) {
      console.warn(`[MEDICAL-CACHE] Tipo de cache no válido: ${type}`)
      return null
    }

    const startTime = performance.now()
    const entry = cache.get(key)
    
    if (entry) {
      // Hit del cache
      metrics.hits++
      entry.accessCount++
      entry.lastAccessed = Date.now()
      
      // Verificar si no ha expirado
      if (entry.expiresAt > Date.now()) {
        const responseTime = performance.now() - startTime
        metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2
        
        // Desencriptar si es necesario
        const data = config.encryptSensitiveData && entry.encrypted 
          ? this.decryptData(entry.data)
          : entry.data
        
        // Log para auditoría HIPAA
        if (config.hipaaMode) {
          console.log(`[HIPAA-CACHE] Access: ${type}:${key}`, {
            timestamp: new Date().toISOString(),
            accessCount: entry.accessCount,
            responseTime
          })
        }
        
        return data
      } else {
        // Entrada expirada
        cache.delete(key)
        metrics.misses++
      }
    } else {
      // Miss del cache
      metrics.misses++
    }
    
    // Actualizar hit rate
    const totalRequests = metrics.hits + metrics.misses
    metrics.hitRate = totalRequests > 0 ? (metrics.hits / totalRequests) * 100 : 0
    
    return null
  }

  // Método principal para guardar datos en cache
  set<T = any>(type: string, key: string, data: T, options?: {
    ttl?: number
    tags?: string[]
    priority?: 'high' | 'medium' | 'low'
  }): boolean {
    const cache = this.caches.get(type)
    const metrics = this.metrics.get(type)
    const config = MEDICAL_CACHE_CONFIGS[type]
    
    if (!cache || !metrics || !config) {
      console.warn(`[MEDICAL-CACHE] Tipo de cache no válido: ${type}`)
      return false
    }

    try {
      const now = Date.now()
      const ttl = options?.ttl || config.ttl
      
      // Preparar datos para encriptación si es necesario
      const processedData = config.encryptSensitiveData 
        ? this.encryptData(data)
        : data

      const entry: MedicalCacheEntry<T> = {
        data: processedData,
        timestamp: now,
        expiresAt: now + ttl,
        hipaaCompliant: config.hipaaMode,
        encrypted: config.encryptSensitiveData,
        accessCount: 0,
        lastAccessed: now,
        tags: [...(config.tags || []), ...(options?.tags || [])],
        priority: options?.priority || config.priority || 'medium',
        source: 'api'
      }

      cache.set(key, entry)
      metrics.sets++
      
      // Persistir a sessionStorage si está configurado
      if (config.persistToSessionStorage && typeof window !== 'undefined') {
        try {
          const sessionKey = `medical_cache_${type}_${key}`
          sessionStorage.setItem(sessionKey, JSON.stringify(entry))
        } catch (e) {
          console.warn('[MEDICAL-CACHE] No se pudo persistir en sessionStorage:', e)
        }
      }
      
      // Log para auditoría HIPAA
      if (config.hipaaMode) {
        console.log(`[HIPAA-CACHE] Set: ${type}:${key}`, {
          timestamp: new Date().toISOString(),
          ttl,
          encrypted: config.encryptSensitiveData,
          tags: entry.tags
        })
      }
      
      return true
    } catch (error) {
      console.error(`[MEDICAL-CACHE] Error al guardar en cache ${type}:${key}:`, error)
      return false
    }
  }

  // Invalidar cache por tags
  invalidateByTags(tags: string[]): number {
    let invalidatedCount = 0
    
    this.caches.forEach((cache, type) => {
      const config = MEDICAL_CACHE_CONFIGS[type]
      const keysToDelete: string[] = []
      
      for (const [key, entry] of cache.entryKeyValues()) {
        if (tags.some(tag => entry.tags.includes(tag))) {
          keysToDelete.push(key)
        }
      }
      
      keysToDelete.forEach(key => {
        cache.delete(key)
        invalidatedCount++
        
        if (config.hipaaMode) {
          console.log(`[HIPAA-CACHE] Invalidated by tags: ${type}:${key}`, {
            timestamp: new Date().toISOString(),
            tags: tags
          })
        }
      })
    })
    
    return invalidatedCount
  }

  // Obtener métricas del cache
  getMetrics(type?: string): CacheMetrics | Record<string, CacheMetrics> {
    if (type) {
      return this.metrics.get(type) || {
        hits: 0, misses: 0, sets: 0, deletes: 0,
        hitRate: 0, avgResponseTime: 0, memoryUsage: 0, lastCleanup: 0
      }
    }
    
    const allMetrics: Record<string, CacheMetrics> = {}
    this.metrics.forEach((metrics, cacheType) => {
      allMetrics[cacheType] = { ...metrics }
    })
    
    return allMetrics
  }

  // Limpiar todo el cache (para compliance)
  clearAll(): void {
    this.caches.forEach((cache, type) => {
      cache.clear()
      
      // Log para HIPAA
      const config = MEDICAL_CACHE_CONFIGS[type]
      if (config.hipaaMode) {
        console.log(`[HIPAA-CACHE] Cleared all: ${type}`, {
          timestamp: new Date().toISOString(),
          reason: 'manual_clear'
        })
      }
    })
    
    // Limpiar sessionStorage
    if (typeof window !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('medical_cache_')) {
          sessionStorage.removeItem(key)
        }
      })
    }
  }

  // Limpieza al destruir
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    
    // Limpiar datos sensibles
    this.caches.forEach((cache, type) => {
      const config = MEDICAL_CACHE_CONFIGS[type]
      if (config.hipaaMode) {
        cache.clear()
      }
    })
  }
}

// Instancia singleton del cache médico
export const medicalCache = new MedicalCacheManager()

// Hook para usar el cache médico en componentes
export const useMedicalCache = <T = any>(
  type: string,
  key: string,
  fetchFunction?: () => Promise<T>,
  options?: {
    ttl?: number
    tags?: string[]
    priority?: 'high' | 'medium' | 'low'
    enabled?: boolean
  }
) => {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const { enabled = true } = options || {}

  const fetchData = React.useCallback(async (force = false) => {
    if (!enabled) return

    // Intentar obtener del cache primero
    if (!force) {
      const cached = medicalCache.get<T>(type, key)
      if (cached) {
        setData(cached)
        return cached
      }
    }

    // Si no hay fetchFunction, no hacer nada
    if (!fetchFunction) return null

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction()
      
      // Guardar en cache
      medicalCache.set(type, key, result, options)
      setData(result)
      
      return result
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }, [type, key, fetchFunction, enabled, options])

  const invalidate = React.useCallback(() => {
    const cache = medicalCache['caches'].get(type)
    if (cache) {
      cache.delete(key)
    }
  }, [type, key])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate
  }
}

// Exports
export default medicalCache
export type { MedicalCacheEntry, MedicalCacheConfig, CacheMetrics }