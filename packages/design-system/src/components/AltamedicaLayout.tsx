/**
 * Layout Altamedica - Componente Reutilizable
 * Diseño responsive con azul celeste consistente
 */

import React from 'react'
import { ALTAMEDICA_COLORS } from '../theme/altamedica-theme'

export interface AltamedicaLayoutProps {
  children: React.ReactNode
  variant?: 'default' | 'dashboard' | 'auth' | 'medical'
  sidebar?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export const AltamedicaLayout: React.FC<AltamedicaLayoutProps> = ({
  children,
  variant = 'default',
  sidebar,
  header,
  footer,
  className = '',
  maxWidth = 'xl',
  padding = 'md'
}) => {
  // Clases base
  const baseClasses = `
    min-h-screen bg-gray-50
    flex flex-col
  `

  // Variantes
  const variantClasses = {
    default: 'bg-white',
    dashboard: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50',
    auth: 'bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100',
    medical: 'bg-gradient-to-br from-sky-50 to-blue-50'
  }

  // Max width
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full'
  }

  // Padding
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  // Clases finales
  const layoutClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${className}
  `.trim()

  const containerClasses = `
    ${maxWidthClasses[maxWidth]}
    ${paddingClasses[padding]}
    mx-auto w-full
  `.trim()

  return (
    <div className={layoutClasses}>
      {/* Header */}
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className={containerClasses}>
            {header}
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 bg-white shadow-lg border-r border-gray-200 hidden lg:block">
            <div className="sticky top-0 h-screen overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Content */}
        <div className="flex-1">
          <div className={containerClasses}>
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200">
          <div className={containerClasses}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  )
}

// Componente de header médico
export const MedicalHeader: React.FC<{
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}> = ({ title, subtitle, actions, breadcrumbs }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        className="text-sm font-medium text-sky-600 hover:text-sky-700"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title and actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de sidebar médica
export const MedicalSidebar: React.FC<{
  menuItems: Array<{
    label: string
    href: string
    icon?: React.ReactNode
    badge?: string | number
    active?: boolean
  }>
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
}> = ({ menuItems, user }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ALTAMEDICA</span>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {user.avatar ? (
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`
              flex items-center px-3 py-2 text-sm font-medium rounded-lg
              transition-colors duration-200
              ${item.active
                ? 'bg-sky-100 text-sky-700 border border-sky-200'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            {item.icon && (
              <span className="mr-3 w-5 h-5">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${item.active
                  ? 'bg-sky-200 text-sky-800'
                  : 'bg-gray-200 text-gray-800'
                }
              `}>
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2024 Altamedica
        </div>
      </div>
    </div>
  )
}

// Componente de footer médico
export const MedicalFooter: React.FC<{
  links?: Array<{ label: string; href: string }>
  copyright?: string
}> = ({ links, copyright = '© 2024 Altamedica. Todos los derechos reservados.' }) => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-sky-500 to-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-sm text-gray-600">{copyright}</span>
          </div>
          
          {links && links.length > 0 && (
            <nav className="flex space-x-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-sky-600 transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}

export default AltamedicaLayout 