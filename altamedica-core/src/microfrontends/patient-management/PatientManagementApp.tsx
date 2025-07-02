// Micro-frontend de Gestión de Pacientes Optimizado - Altamedica
// Lazy loading + Performance optimization + HIPAA compliance

'use client'

import React, { memo, useEffect, useMemo, useState, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import LazyMedicalComponent from '@/lazy/LazyMedicalComponent'
import { MedicalCard } from '@/shared'
import { useMedicalCache } from '@/optimized/cache/MedicalCacheManager'
import { PacienteBase } from '@/types/medical'

// Componente de carga específico para gestión de pacientes
const PatientLoadingComponent = memo(() => (
  <div className="min-h-screen bg-medical-background p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>
      
      {/* Search bar skeleton */}
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-full max-w-md"></div>
      </div>
      
      {/* Table skeleton */}
      <MedicalCard className="animate-pulse">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </MedicalCard>
    </div>
  </div>
))

PatientLoadingComponent.displayName = 'PatientLoadingComponent'

// Componente de error específico para pacientes
const PatientErrorComponent = memo<{ 
  error: Error; 
  retry: () => void 
}>(({ error, retry }) => (
  <div className="min-h-screen bg-medical-background p-6 flex items-center justify-center">
    <MedicalCard variant="emergency" className="max-w-md">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl text-red-600">⚠️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error en Gestión de Pacientes
          </h3>
          <p className="text-sm text-red-600 mb-4">
            No se pudo cargar el módulo de gestión de pacientes.
          </p>
          <details className="text-xs text-red-500 bg-red-50 p-2 rounded">
            <summary className="cursor-pointer font-medium mb-2">
              Detalles técnicos
            </summary>
            <code className="block whitespace-pre-wrap">{error.message}</code>
          </details>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={retry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
          >
            Recargar Página
          </button>
        </div>
      </div>
    </MedicalCard>
  </div>
))

PatientErrorComponent.displayName = 'PatientErrorComponent'

// Props del componente principal
interface PatientManagementAppProps {
  initialFilters?: Record<string, any>
  onPatientSelect?: (patient: PacienteBase) => void
  onPatientUpdate?: (patient: PacienteBase) => void
  embedded?: boolean
  performance?: {
    priority?: 'high' | 'medium' | 'low'
    preload?: boolean
    enableMetrics?: boolean
  }
}

// Componente principal del micro-frontend
const PatientManagementApp: React.FC<PatientManagementAppProps> = memo(({
  initialFilters = {},
  onPatientSelect,
  onPatientUpdate,
  embedded = false,
  performance = { priority: 'high', preload: false, enableMetrics: true }
}) => {
  // Estados de performance monitoring
  const [renderMetrics, setRenderMetrics] = useState({
    mountTime: 0,
    renderTime: 0,
    componentCount: 0
  })

  // Cache de pacientes con configuración optimizada
  const {
    data: patientsData,
    loading: cacheLoading,
    error: cacheError,
    refetch: refetchPatients
  } = useMedicalCache(
    'patients',
    `patients_list_${JSON.stringify(initialFilters)}`,
    async () => {
      // Simular llamada a API optimizada
      const response = await fetch('/api/optimized/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Performance-Priority': performance.priority || 'medium',
          'X-Component': 'PatientManagementApp'
        },
        body: JSON.stringify({
          pagina: 1,
          tamanoPagina: 20,
          filtros: initialFilters
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    },
    {
      ttl: 2 * 60 * 1000, // 2 minutos
      priority: performance.priority,
      enabled: true
    }
  )

  // Medir performance del componente
  useEffect(() => {
    const mountTime = performance.now()
    
    return () => {
      if (performance.enableMetrics) {
        console.log('[MEDICAL-PERFORMANCE] PatientManagementApp unmounted', {
          mountTime,
          totalTime: performance.now() - mountTime,
          componentType: 'microfrontend'
        })
      }
    }
  }, [performance.enableMetrics])

  // Callback optimizado para selección de paciente
  const handlePatientSelect = useCallback((patient: PacienteBase) => {
    if (onPatientSelect) {
      onPatientSelect(patient)
    }
    
    // Log para auditoría HIPAA
    console.log('[HIPAA-AUDIT] Patient selected', {
      patientId: patient.id,
      timestamp: new Date().toISOString(),
      component: 'PatientManagementApp'
    })
  }, [onPatientSelect])

  // Configuración del lazy component optimizada
  const lazyConfig = useMemo(() => ({
    priority: performance.priority || 'high',
    preload: performance.preload,
    timeout: 15000, // 15 segundos para componentes médicos críticos
    retryAttempts: 3,
    medicalCompliance: true,
    cacheStrategy: 'memory' as const,
    loadingComponent: PatientLoadingComponent,
    errorFallback: PatientErrorComponent
  }), [performance])

  // Props optimizadas para el componente interno
  const componentProps = useMemo(() => ({
    initialFilters,
    patientsData,
    cacheLoading,
    cacheError,
    onPatientSelect: handlePatientSelect,
    onPatientUpdate,
    refetchPatients,
    embedded,
    performance: renderMetrics
  }), [
    initialFilters,
    patientsData,
    cacheLoading,
    cacheError,
    handlePatientSelect,
    onPatientUpdate,
    refetchPatients,
    embedded,
    renderMetrics
  ])

  // Renderizado con error boundary médico
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <PatientErrorComponent 
          error={error} 
          retry={resetErrorBoundary}
        />
      )}
      onError={(error, errorInfo) => {
        console.error('[MEDICAL-ERROR] PatientManagementApp error:', error, errorInfo)
        
        // Reportar error para monitoreo médico
        if (performance.enableMetrics) {
          // Aquí iría integración con sistema de monitoreo médico
          console.log('[MEDICAL-ERROR-REPORT]', {
            error: error.message,
            component: 'PatientManagementApp',
            timestamp: new Date().toISOString(),
            stack: error.stack
          })
        }
      }}
    >
      <div 
        className={embedded ? '' : 'min-h-screen bg-medical-background'}
        data-component="patient-management-microfrontend"
        data-performance-priority={performance.priority}
      >
        <LazyMedicalComponent
          moduleId="patient-management"
          componentName="GestionPacientesOptimized"
          config={lazyConfig}
          props={componentProps}
        >
          {/* Fallback content mientras carga */}
          <PatientLoadingComponent />
        </LazyMedicalComponent>
      </div>
    </ErrorBoundary>
  )
})

PatientManagementApp.displayName = 'PatientManagementApp'

// Component para preloading
export const preloadPatientManagement = () => {
  // Precargar el módulo si no está en cache
  import('@/components/medical/GestionPacientes').catch(error => {
    console.warn('[PRELOAD] Failed to preload patient management:', error)
  })
}

// Wrapper para uso standalone
const PatientManagementStandalone: React.FC<Omit<PatientManagementAppProps, 'embedded'>> = (props) => (
  <PatientManagementApp {...props} embedded={false} />
)

// Wrapper para uso embebido
const PatientManagementEmbedded: React.FC<Omit<PatientManagementAppProps, 'embedded'>> = (props) => (
  <PatientManagementApp {...props} embedded={true} />
)

// Exports optimizados
export default PatientManagementApp
export { PatientManagementStandalone, PatientManagementEmbedded }
export type { PatientManagementAppProps }