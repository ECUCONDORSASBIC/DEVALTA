/**
 * Botón Altamedica - Componente Reutilizable
 * Diseño responsive con azul celeste consistente
 */

import React from 'react'
import { ALTAMEDICA_COLORS, TRANSITIONS } from '../theme/altamedica-theme'

export interface AltamedicaButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const AltamedicaButton: React.FC<AltamedicaButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left'
}) => {
  // Clases base
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-[1.02] active:scale-[0.98]
  `

  // Variantes de color
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-sky-500 to-blue-500
      hover:from-sky-600 hover:to-blue-600
      text-white shadow-md hover:shadow-lg
      focus:ring-sky-500
    `,
    secondary: `
      bg-gradient-to-r from-blue-500 to-indigo-500
      hover:from-blue-600 hover:to-indigo-600
      text-white shadow-md hover:shadow-lg
      focus:ring-blue-500
    `,
    outline: `
      bg-transparent border-2 border-sky-500
      hover:bg-sky-50 hover:border-sky-600
      text-sky-600 hover:text-sky-700
      focus:ring-sky-500
    `,
    ghost: `
      bg-transparent hover:bg-sky-50
      text-sky-600 hover:text-sky-700
      focus:ring-sky-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500
      hover:from-red-600 hover:to-pink-600
      text-white shadow-md hover:shadow-lg
      focus:ring-red-500
    `
  }

  // Tamaños
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  // Ancho completo
  const widthClass = fullWidth ? 'w-full' : ''

  // Estado de carga
  const loadingClass = loading ? 'cursor-wait' : ''

  // Clases finales
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${loadingClass}
    ${className}
  `.trim()

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

export default AltamedicaButton 