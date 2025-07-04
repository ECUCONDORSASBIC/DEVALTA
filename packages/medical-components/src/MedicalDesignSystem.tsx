// 🏥 MEDICAL DESIGN SYSTEM - DEVALTAMEDICA
// Sistema de diseño médico completo con compliance HIPAA

import React, { createContext, useContext, ReactNode } from 'react'

// ============================================================================
// TOKENS DE DISEÑO MÉDICO
// ============================================================================

export const MedicalTokens = {
  // Colores médicos semánticos
  colors: {
    // Estados de salud
    health: {
      critical: '#DC2626',    // Rojo crítico
      warning: '#F59E0B',     // Amarillo advertencia
      stable: '#10B981',      // Verde estable
      normal: '#3B82F6',      // Azul normal
      info: '#8B5CF6'         // Púrpura información
    },
    
    // Roles médicos
    roles: {
      doctor: '#1E40AF',      // Azul médico
      nurse: '#059669',       // Verde enfermero
      patient: '#7C3AED',     // Púrpura paciente
      admin: '#6B7280',       // Gris administrador
      emergency: '#DC2626'    // Rojo emergencia
    },
    
    // Estados de citas
    appointments: {
      scheduled: '#3B82F6',   // Programada
      confirmed: '#10B981',   // Confirmada
      inProgress: '#F59E0B',  // En curso
      completed: '#059669',   // Completada
      cancelled: '#DC2626',   // Cancelada
      noShow: '#6B7280'       // No asistió
    },
    
    // Compliance HIPAA
    compliance: {
      secure: '#059669',      // Verde seguro
      warning: '#F59E0B',     // Amarillo advertencia
      violation: '#DC2626',   // Rojo violación
      audit: '#8B5CF6'        // Púrpura auditoría
    }
  },
  
  // Tipografía médica
  typography: {
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      medical: 'Roboto Mono, monospace', // Para datos médicos
      display: 'Poppins, sans-serif'     // Para títulos
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Espaciado médico
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Bordes y sombras médicos
  borders: {
    radius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px'
    },
    width: {
      thin: '1px',
      normal: '2px',
      thick: '3px'
    }
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },
  
  // Breakpoints médicos
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
}

// ============================================================================
// CONTEXTO DEL TEMA MÉDICO
// ============================================================================

interface MedicalThemeContextType {
  tokens: typeof MedicalTokens
  mode: 'light' | 'dark' | 'high-contrast'
  compliance: 'hipaa' | 'gdpr' | 'both'
}

const MedicalThemeContext = createContext<MedicalThemeContextType | undefined>(undefined)

export function useMedicalTheme() {
  const context = useContext(MedicalThemeContext)
  if (!context) {
    throw new Error('useMedicalTheme debe usarse dentro de MedicalThemeProvider')
  }
  return context
}

interface MedicalThemeProviderProps {
  children: ReactNode
  mode?: 'light' | 'dark' | 'high-contrast'
  compliance?: 'hipaa' | 'gdpr' | 'both'
}

export function MedicalThemeProvider({ 
  children, 
  mode = 'light', 
  compliance = 'hipaa' 
}: MedicalThemeProviderProps) {
  const value: MedicalThemeContextType = {
    tokens: MedicalTokens,
    mode,
    compliance
  }
  
  return (
    <MedicalThemeContext.Provider value={value}>
      {children}
    </MedicalThemeContext.Provider>
  )
}

// ============================================================================
// COMPONENTES BASE MÉDICOS
// ============================================================================

// Botón médico con estados de salud
interface MedicalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'critical' | 'warning' | 'stable' | 'normal'
  size?: 'sm' | 'md' | 'lg'
  role?: 'doctor' | 'nurse' | 'patient' | 'admin' | 'emergency'
  compliance?: boolean
}

export function MedicalButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  role,
  compliance = true,
  className,
  ...props 
}: MedicalButtonProps) {
  const { tokens } = useMedicalTheme()
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    critical: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
    stable: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    normal: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const roleClasses = role ? `border-l-4 border-l-${tokens.colors.roles[role]}` : ''
  const complianceClasses = compliance ? 'shadow-md' : 'shadow-lg border-2 border-red-500'
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roleClasses} ${complianceClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Card médica con información de paciente
interface MedicalCardProps {
  children: ReactNode
  variant?: 'patient' | 'appointment' | 'vital' | 'medication' | 'alert'
  status?: 'normal' | 'warning' | 'critical' | 'stable'
  className?: string
}

export function MedicalCard({ 
  children, 
  variant = 'patient', 
  status = 'normal',
  className 
}: MedicalCardProps) {
  const baseClasses = 'bg-white rounded-lg shadow-md border border-gray-200 p-6'
  
  const variantClasses = {
    patient: 'border-l-4 border-l-blue-500',
    appointment: 'border-l-4 border-l-green-500',
    vital: 'border-l-4 border-l-purple-500',
    medication: 'border-l-4 border-l-orange-500',
    alert: 'border-l-4 border-l-red-500'
  }
  
  const statusClasses = {
    normal: 'bg-white',
    warning: 'bg-yellow-50 border-yellow-200',
    critical: 'bg-red-50 border-red-200',
    stable: 'bg-green-50 border-green-200'
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${statusClasses[status]} ${className || ''}`}>
      {children}
    </div>
  )
}

// Badge médico para estados y roles
interface MedicalBadgeProps {
  children: ReactNode
  variant?: 'status' | 'role' | 'priority' | 'compliance'
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MedicalBadge({ 
  children, 
  variant = 'status', 
  color = 'blue',
  size = 'md',
  className 
}: MedicalBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  }
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  }
  
  return (
    <span className={`${baseClasses} ${colorClasses[color]} ${sizeClasses[size]} ${className || ''}`}>
      {children}
    </span>
  )
}

// Input médico con validación HIPAA
interface MedicalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
  compliance?: boolean
  fieldType?: 'patient' | 'medical' | 'contact' | 'sensitive'
}

export function MedicalInput({ 
  label, 
  error, 
  required = false,
  compliance = true,
  fieldType = 'patient',
  className,
  ...props 
}: MedicalInputProps) {
  const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
  const complianceClasses = compliance ? '' : 'border-red-500 bg-red-50'
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`${baseClasses} ${errorClasses} ${complianceClasses} ${className || ''}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {!compliance && (
        <p className="text-sm text-red-600">⚠️ Campo requiere validación de compliance</p>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTES ESPECIALIZADOS MÉDICOS
// ============================================================================

// Vital Signs Display
interface VitalSignsProps {
  vitals: {
    temperature?: number
    bloodPressure?: { systolic: number; diastolic: number }
    heartRate?: number
    oxygenSaturation?: number
    respiratoryRate?: number
  }
  timestamp: Date
  unit?: 'metric' | 'imperial'
}

export function VitalSigns({ vitals, timestamp, unit = 'metric' }: VitalSignsProps) {
  const getStatusColor = (value: number, normalRange: [number, number]) => {
    if (value < normalRange[0]) return 'text-blue-600'
    if (value > normalRange[1]) return 'text-red-600'
    return 'text-green-600'
  }
  
  return (
    <MedicalCard variant="vital" className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Signos Vitales</h3>
        <span className="text-sm text-gray-500">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {vitals.temperature && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {vitals.temperature}°{unit === 'metric' ? 'C' : 'F'}
            </div>
            <div className="text-sm text-gray-500">Temperatura</div>
          </div>
        )}
        
        {vitals.bloodPressure && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
            </div>
            <div className="text-sm text-gray-500">Presión Arterial</div>
          </div>
        )}
        
        {vitals.heartRate && (
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(vitals.heartRate, [60, 100])}`}>
              {vitals.heartRate} bpm
            </div>
            <div className="text-sm text-gray-500">Frecuencia Cardíaca</div>
          </div>
        )}
        
        {vitals.oxygenSaturation && (
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(vitals.oxygenSaturation, [95, 100])}`}>
              {vitals.oxygenSaturation}%
            </div>
            <div className="text-sm text-gray-500">Saturación O₂</div>
          </div>
        )}
      </div>
    </MedicalCard>
  )
}

// Appointment Status Indicator
interface AppointmentStatusProps {
  status: 'scheduled' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled' | 'noShow'
  time: Date
  duration: number
}

export function AppointmentStatus({ status, time, duration }: AppointmentStatusProps) {
  const statusConfig = {
    scheduled: { color: 'blue', icon: '📅', label: 'Programada' },
    confirmed: { color: 'green', icon: '✅', label: 'Confirmada' },
    inProgress: { color: 'yellow', icon: '🔄', label: 'En Curso' },
    completed: { color: 'green', icon: '✅', label: 'Completada' },
    cancelled: { color: 'red', icon: '❌', label: 'Cancelada' },
    noShow: { color: 'gray', icon: '⏰', label: 'No Asistió' }
  }
  
  const config = statusConfig[status]
  
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-2xl">{config.icon}</span>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{config.label}</div>
        <div className="text-sm text-gray-500">
          {time.toLocaleTimeString()} ({duration} min)
        </div>
      </div>
      <MedicalBadge color={config.color as any} variant="status">
        {config.label}
      </MedicalBadge>
    </div>
  )
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export {
  MedicalTokens,
  MedicalThemeProvider,
  useMedicalTheme,
  MedicalButton,
  MedicalCard,
  MedicalBadge,
  MedicalInput,
  VitalSigns,
  AppointmentStatus
}

export default {
  MedicalTokens,
  MedicalThemeProvider,
  useMedicalTheme,
  MedicalButton,
  MedicalCard,
  MedicalBadge,
  MedicalInput,
  VitalSigns,
  AppointmentStatus
}
