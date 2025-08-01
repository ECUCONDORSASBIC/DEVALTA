/**
 * Tarjeta Altamedica - Componente Reutilizable
 * Diseño responsive con azul celeste consistente
 */

import React from 'react'
import { ALTAMEDICA_COLORS, SHADOWS, BORDER_RADIUS } from '../theme/altamedica-theme'

export interface AltamedicaCardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onClick?: () => void
  hover?: boolean
  loading?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
  image?: {
    src: string
    alt: string
    height?: string
  }
}

export const AltamedicaCard: React.FC<AltamedicaCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  padding = 'md',
  className = '',
  onClick,
  hover = false,
  loading = false,
  header,
  footer,
  image
}) => {
  // Clases base
  const baseClasses = `
    bg-white rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-sky-500
  `

  // Variantes
  const variantClasses = {
    default: `
      border border-gray-200
      shadow-sm hover:shadow-md
    `,
    elevated: `
      border-0
      shadow-lg hover:shadow-xl
      transform hover:-translate-y-1
    `,
    outlined: `
      border-2 border-sky-200
      shadow-sm hover:shadow-md
      hover:border-sky-300
    `,
    gradient: `
      border-0
      bg-gradient-to-br from-sky-50 to-blue-50
      shadow-md hover:shadow-lg
    `
  }

  // Tamaños
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }

  // Padding
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  // Hover
  const hoverClass = hover ? 'cursor-pointer hover:scale-[1.02]' : ''

  // Loading
  const loadingClass = loading ? 'animate-pulse' : ''

  // Clases finales
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${hoverClass}
    ${loadingClass}
    ${className}
  `.trim()

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Imagen */}
      {image && (
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full object-cover"
            style={{ height: image.height || '200px' }}
          />
          {loading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </div>
      )}

      {/* Header */}
      {header && (
        <div className={`px-6 py-4 border-b border-gray-100 ${image ? '' : 'rounded-t-xl'}`}>
          {header}
        </div>
      )}

      {/* Contenido */}
      <div className={paddingClasses[padding]}>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 rounded-b-xl bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  )
}

// Componente de tarjeta de estadísticas médicas
export const MedicalStatsCard: React.FC<{
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  color?: keyof typeof ALTAMEDICA_COLORS.medical
}> = ({ title, value, change, trend, icon, color = 'blood' }) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }

  return (
    <AltamedicaCard variant="elevated" size="sm" padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${trendColors[trend || 'neutral']}`}>
              {trendIcons[trend || 'neutral']} {change}
            </p>
          )}
        </div>
        {icon && (
          <div 
            className="p-3 rounded-full"
            style={{ backgroundColor: `${ALTAMEDICA_COLORS.medical[color]}20` }}
          >
            <div 
              className="w-6 h-6"
              style={{ color: ALTAMEDICA_COLORS.medical[color] }}
            >
              {icon}
            </div>
          </div>
        )}
      </div>
    </AltamedicaCard>
  )
}

// Componente de tarjeta de paciente
export const PatientCard: React.FC<{
  patient: {
    id: string
    name: string
    age: number
    gender: string
    lastVisit?: string
    status?: 'active' | 'inactive' | 'pending'
    avatar?: string
  }
  onClick?: () => void
}> = ({ patient, onClick }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <AltamedicaCard 
      variant="outlined" 
      hover 
      onClick={onClick}
      className="hover:border-sky-400"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {patient.avatar ? (
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={patient.avatar}
              alt={patient.name}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold">
              {patient.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {patient.name}
          </p>
          <p className="text-sm text-gray-500">
            {patient.age} años • {patient.gender}
          </p>
          {patient.lastVisit && (
            <p className="text-xs text-gray-400">
              Última visita: {new Date(patient.lastVisit).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {patient.status && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[patient.status]}`}>
            {patient.status === 'active' && 'Activo'}
            {patient.status === 'inactive' && 'Inactivo'}
            {patient.status === 'pending' && 'Pendiente'}
          </span>
        )}
      </div>
    </AltamedicaCard>
  )
}

export default AltamedicaCard 