// Componente MedicalCard optimizado para Micro-frontends
// Shared Component - Altamedica

'use client'

import React, { memo, forwardRef, useMemo } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

// Variantes de estilo usando CVA para optimización
const medicalCardVariants = cva(
  // Estilos base
  'rounded-lg border transition-all duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-medical-surface border-gray-200 shadow-medical',
        patient: 'bg-medical-surface border-medical-primary/20 shadow-patient-card',
        appointment: 'bg-medical-surface border-medical-accent/20 shadow-appointment',
        emergency: 'bg-red-50 border-red-200 shadow-lg',
        secure: 'bg-medical-surface border-hipaa-secure/20 shadow-hipaa-secure'
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        false: ''
      },
      loading: {
        true: 'animate-pulse pointer-events-none',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
      loading: false
    }
  }
)

// Props interface optimizada
interface MedicalCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof medicalCardVariants> {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
  hipaaSecure?: boolean
  loading?: boolean
  error?: string | null
  performance?: {
    priority?: 'high' | 'medium' | 'low'
    lazy?: boolean
  }
}

// Componente optimizado con memo y forwardRef
const MedicalCard = memo(forwardRef<HTMLDivElement, MedicalCardProps>(
  ({ 
    className,
    variant,
    size,
    interactive,
    loading,
    children,
    title,
    subtitle,
    action,
    hipaaSecure = false,
    error,
    performance = { priority: 'medium', lazy: false },
    ...props
  }, ref) => {
    
    // Memoizar el className para evitar re-cálculos
    const cardClassName = useMemo(() => cn(
      medicalCardVariants({ 
        variant: hipaaSecure ? 'secure' : variant, 
        size, 
        interactive, 
        loading 
      }),
      className
    ), [variant, size, interactive, loading, hipaaSecure, className])

    // Memoizar el header si existe title o action
    const header = useMemo(() => {
      if (!title && !action) return null
      
      return (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-medical-text truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-medical-neutral mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
      )
    }, [title, subtitle, action])

    // Indicador HIPAA si está habilitado
    const hipaaIndicator = useMemo(() => {
      if (!hipaaSecure) return null
      
      return (
        <div className="absolute top-2 right-2 w-2 h-2 bg-hipaa-secure rounded-full" 
             title="HIPAA Secure" />
      )
    }, [hipaaSecure])

    // Error state
    if (error) {
      return (
        <div 
          ref={ref}
          className={cn(
            'p-4 border border-red-200 bg-red-50 rounded-lg',
            'flex items-center gap-3 text-red-700'
          )}
          {...props}
        >
          <div className="w-5 h-5 border-2 border-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">!</span>
          </div>
          <span className="text-sm">{error}</span>
        </div>
      )
    }

    // Loading state optimizado
    if (loading) {
      return (
        <div 
          ref={ref}
          className={cardClassName}
          {...props}
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    }

    return (
      <div 
        ref={ref}
        className={cn(cardClassName, 'relative')}
        data-performance-priority={performance.priority}
        data-lazy={performance.lazy}
        {...props}
      >
        {hipaaIndicator}
        {header}
        <div className="relative">
          {children}
        </div>
      </div>
    )
  }
))

MedicalCard.displayName = 'MedicalCard'

// Export optimizado
export default MedicalCard

// Tipos para re-export
export type { MedicalCardProps }