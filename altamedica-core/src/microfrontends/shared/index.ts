// Índice de Componentes Compartidos - Micro-frontends Médicos
// Exports centralizados para Module Federation

// Componentes UI compartidos
export { default as MedicalCard } from './components/MedicalCard'
export { default as MedicalButton } from './components/MedicalButton'
export { default as MedicalInput } from './components/MedicalInput'
export { default as MedicalModal } from './components/MedicalModal'
export { default as LoadingSpinner } from './components/LoadingSpinner'
export { default as ErrorBoundary } from './components/ErrorBoundary'

// Layouts compartidos
export { default as MedicalLayout } from './layouts/MedicalLayout'
export { default as DashboardLayout } from './layouts/DashboardLayout'
export { default as AuthLayout } from './layouts/AuthLayout'

// Providers compartidos
export { default as MedicalContextProvider } from './providers/MedicalContextProvider'
export { default as ThemeProvider } from './providers/ThemeProvider'
export { default as AuthProvider } from './providers/AuthProvider'

// Hooks compartidos
export { default as useMedicalAuth } from './hooks/useMedicalAuth'
export { default as useMedicalTheme } from './hooks/useMedicalTheme'
export { default as useMedicalNotifications } from './hooks/useMedicalNotifications'
export { default as useMedicalPerformance } from './hooks/useMedicalPerformance'

// Utilidades compartidas
export * from './utils/medicalValidations'
export * from './utils/medicalFormatters'
export * from './utils/performanceUtils'
export * from './utils/cacheUtils'

// Constantes compartidas
export * from './constants/medicalConstants'
export * from './constants/uiConstants'
export * from './constants/performanceConstants'

// Types compartidos (re-export desde tipos principales)
export type {
  PacienteBase,
  CitaMedica,
  ProfesionalMedico,
  RespuestaAPI,
  ParametrosPaginacion
} from '../../../types/medical'

// Configuraciones compartidas
export { default as medicalConfig } from './config/medicalConfig'
export { default as performanceConfig } from './config/performanceConfig'
export { default as cacheConfig } from './config/cacheConfig'