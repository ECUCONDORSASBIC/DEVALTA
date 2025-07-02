// Sistema de Lazy Loading Inteligente para Micro-frontends Médicos
// Altamedica - Performance Optimization + Medical Compliance

'use client'

import React, { 
  Suspense, 
  lazy, 
  memo, 
  useEffect, 
  useState, 
  useCallback,
  useMemo 
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'

// Tipos para configuración de lazy loading
interface LazyLoadConfig {
  priority: 'high' | 'medium' | 'low'
  preload?: boolean
  timeout?: number
  retryAttempts?: number
  fallbackComponent?: React.ComponentType
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
  loadingComponent?: React.ComponentType
  medicalCompliance?: boolean
  cacheStrategy?: 'memory' | 'session' | 'persistent'
}

interface LazyMedicalComponentProps {
  moduleId: string
  componentName: string
  config?: Partial<LazyLoadConfig>
  props?: Record<string, any>
  children?: React.ReactNode
}

// Configuración por defecto optimizada para médico
const defaultConfig: LazyLoadConfig = {
  priority: 'medium',
  preload: false,
  timeout: 10000, // 10 segundos
  retryAttempts: 3,
  medicalCompliance: true,
  cacheStrategy: 'memory'
}

// Cache de componentes cargados
const componentCache = new Map<string, React.ComponentType<any>>()
const loadingPromises = new Map<string, Promise<React.ComponentType<any>>>()

// Componente de loading médico optimizado
const MedicalLoadingSpinner: React.FC<{ message?: string }> = memo(({ 
  message = 'Cargando módulo médico...' 
}) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-medical-primary/20 rounded-full"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-medical-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="text-sm text-medical-neutral font-medium">{message}</p>
    <div className="flex items-center gap-2 text-xs text-hipaa-secure">
      <div className="w-2 h-2 bg-hipaa-secure rounded-full animate-pulse"></div>
      <span>Carga segura HIPAA</span>
    </div>
  </div>
))

MedicalLoadingSpinner.displayName = 'MedicalLoadingSpinner'

// Componente de error médico
const MedicalErrorFallback: React.FC<{ 
  error: Error; 
  retry: () => void;
  moduleId: string;
}> = memo(({ error, retry, moduleId }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
      <span className="text-red-600 text-xl font-bold">!</span>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-red-800">
        Error al cargar módulo médico
      </h3>
      <p className="text-sm text-red-600">
        Módulo: {moduleId}
      </p>
      <p className="text-xs text-red-500 font-mono bg-red-100 p-2 rounded">
        {error.message}
      </p>
    </div>
    <button
      onClick={retry}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Reintentar Carga
    </button>
  </div>
))

MedicalErrorFallback.displayName = 'MedicalErrorFallback'

// Hook para preload inteligente
const useIntelligentPreload = (
  moduleId: string, 
  priority: LazyLoadConfig['priority'],
  preload: boolean
) => {
  useEffect(() => {
    if (!preload) return

    const shouldPreload = () => {
      // Preload inmediato para alta prioridad
      if (priority === 'high') return true
      
      // Preload cuando la conexión es buena
      if (priority === 'medium') {
        const connection = (navigator as any).connection
        return !connection || connection.effectiveType === '4g'
      }
      
      // Preload solo cuando idle para baja prioridad
      if (priority === 'low') {
        return 'requestIdleCallback' in window
      }
      
      return false
    }

    if (shouldPreload()) {
      const preloadFunction = () => {
        if (!componentCache.has(moduleId) && !loadingPromises.has(moduleId)) {
          loadLazyComponent(moduleId, '')
        }
      }

      if (priority === 'low' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(preloadFunction)
      } else {
        // Preload después de que el contenido principal se cargue
        setTimeout(preloadFunction, priority === 'high' ? 0 : 1000)
      }
    }
  }, [moduleId, priority, preload])
}

// Función para cargar componente lazy con reintentos
const loadLazyComponent = async (
  moduleId: string, 
  componentName: string,
  config: LazyLoadConfig = defaultConfig
): Promise<React.ComponentType<any>> => {
  const cacheKey = `${moduleId}:${componentName}`
  
  // Verificar cache primero
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!
  }

  // Verificar si ya está cargando
  if (loadingPromises.has(cacheKey)) {
    return loadingPromises.get(cacheKey)!
  }

  // Función de carga con reintentos
  const loadWithRetry = async (attempts: number = 0): Promise<React.ComponentType<any>> => {
    try {
      // Timeout para la carga
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout al cargar módulo médico')), config.timeout)
      })

      // Lógica de importación dinámica basada en moduleId
      let importPromise: Promise<any>

      switch (moduleId) {
        case 'patient-management':
          importPromise = import('@/microfrontends/patient-management/PatientManagementApp')
          break
        case 'appointment-scheduling':
          importPromise = import('@/microfrontends/appointment-scheduling/AppointmentApp')
          break
        case 'telemedicine':
          importPromise = import('@/microfrontends/telemedicine/TelemedicineApp')
          break
        default:
          throw new Error(`Módulo médico no encontrado: ${moduleId}`)
      }

      const module = await Promise.race([importPromise, timeoutPromise])
      const Component = componentName ? module[componentName] : module.default

      if (!Component) {
        throw new Error(`Componente ${componentName} no encontrado en módulo ${moduleId}`)
      }

      // Guardar en cache
      componentCache.set(cacheKey, Component)
      
      // Logging para compliance médico
      if (config.medicalCompliance) {
        console.log(`[HIPAA-LOG] Módulo médico cargado: ${moduleId}:${componentName}`, {
          timestamp: new Date().toISOString(),
          loadTime: performance.now(),
          cacheStrategy: config.cacheStrategy
        })
      }

      return Component

    } catch (error) {
      if (attempts < config.retryAttempts!) {
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        return loadWithRetry(attempts + 1)
      }
      
      throw new Error(`Error al cargar módulo médico ${moduleId} después de ${config.retryAttempts} intentos: ${error.message}`)
    }
  }

  const loadingPromise = loadWithRetry()
  loadingPromises.set(cacheKey, loadingPromise)

  try {
    const result = await loadingPromise
    loadingPromises.delete(cacheKey)
    return result
  } catch (error) {
    loadingPromises.delete(cacheKey)
    throw error
  }
}

// Componente principal de lazy loading médico
const LazyMedicalComponent: React.FC<LazyMedicalComponentProps> = memo(({
  moduleId,
  componentName,
  config: userConfig = {},
  props = {},
  children
}) => {
  const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig])
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Hook de preload inteligente
  useIntelligentPreload(moduleId, config.priority!, config.preload!)

  // Función de carga del componente
  const loadComponent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const LoadedComponent = await loadLazyComponent(moduleId, componentName, config)
      setComponent(() => LoadedComponent)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [moduleId, componentName, config])

  // Cargar componente al montar
  useEffect(() => {
    loadComponent()
  }, [loadComponent])

  // Función de retry
  const retry = useCallback(() => {
    const cacheKey = `${moduleId}:${componentName}`
    componentCache.delete(cacheKey)
    loadComponent()
  }, [moduleId, componentName, loadComponent])

  // Renderizado condicional
  if (error) {
    const ErrorComponent = config.errorFallback || MedicalErrorFallback
    return <ErrorComponent error={error} retry={retry} moduleId={moduleId} />
  }

  if (loading || !Component) {
    const LoadingComponent = config.loadingComponent || MedicalLoadingSpinner
    return <LoadingComponent message={`Cargando ${moduleId}...`} />
  }

  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <MedicalErrorFallback 
          error={error} 
          retry={resetErrorBoundary} 
          moduleId={moduleId}
        />
      )}
      onError={(error) => {
        console.error(`[MEDICAL-ERROR] Error en micro-frontend ${moduleId}:`, error)
      }}
    >
      <Component {...props}>
        {children}
      </Component>
    </ErrorBoundary>
  )
})

LazyMedicalComponent.displayName = 'LazyMedicalComponent'

// Hook para lazy loading médico
export const useLazyMedical = (moduleId: string, componentName: string = 'default') => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async (config?: Partial<LazyLoadConfig>) => {
    if (isLoaded || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      await loadLazyComponent(moduleId, componentName, { ...defaultConfig, ...config })
      setIsLoaded(true)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [moduleId, componentName, isLoaded, isLoading])

  const preload = useCallback((config?: Partial<LazyLoadConfig>) => {
    if (!isLoaded && !isLoading) {
      load({ ...config, priority: 'low' })
    }
  }, [load, isLoaded, isLoading])

  return { isLoaded, isLoading, error, load, preload }
}

// Exports optimizados
export default LazyMedicalComponent
export { MedicalLoadingSpinner, MedicalErrorFallback }
export type { LazyLoadConfig, LazyMedicalComponentProps }