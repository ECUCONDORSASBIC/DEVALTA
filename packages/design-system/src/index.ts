/**
 * Design System Altamedica - Índice Principal
 * Sistema de diseño compartido con azul celeste consistente
 */

// Tema y configuración
export * from './theme/altamedica-theme'

// Componentes base
export { default as AltamedicaButton } from './components/AltamedicaButton'
export type { AltamedicaButtonProps } from './components/AltamedicaButton'

export { default as AltamedicaCard, MedicalStatsCard, PatientCard } from './components/AltamedicaCard'
export type { AltamedicaCardProps } from './components/AltamedicaCard'

export { 
  default as AltamedicaLayout, 
  MedicalHeader,
  MedicalSidebar,
  MedicalFooter
} from './components/AltamedicaLayout'
export type { AltamedicaLayoutProps } from './components/AltamedicaLayout'

// Utilidades de diseño
export const designUtils = {
  /**
   * Genera clases CSS para el tema Altamedica
   */
  generateThemeClasses: () => {
    return {
      '.altamedica-bg': {
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
      },
      '.altamedica-text': {
        color: '#0ea5e9'
      },
      '.altamedica-border': {
        borderColor: '#0ea5e9'
      },
      '.altamedica-shadow': {
        boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -4px rgba(14, 165, 233, 0.1)'
      }
    }
  },

  /**
   * Obtiene el color primario de Altamedica
   */
  getPrimaryColor: () => '#0ea5e9',

  /**
   * Obtiene el gradiente principal de Altamedica
   */
  getPrimaryGradient: () => 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',

  /**
   * Genera clases responsive
   */
  getResponsiveClasses: (baseClass: string, responsive: Record<string, string>) => {
    let classes = baseClass
    for (const [breakpoint, className] of Object.entries(responsive)) {
      classes += ` ${breakpoint}:${className}`
    }
    return classes
  }
}

// Configuración del design system
export const DESIGN_SYSTEM_CONFIG = {
  name: 'Altamedica Design System',
  version: '1.0.0',
  primaryColor: '#0ea5e9',
  brandName: 'ALTAMEDICA',
  description: 'Sistema de diseño compartido para microservicios de Altamedica',
  author: 'Altamedica Team',
  repository: 'https://github.com/altamedica/design-system'
} as const

// Tipos exportados
export type {
  AltamedicaColor,
  AltamedicaBreakpoint,
  AltamedicaSpacing,
  AltamedicaTheme
} from './theme/altamedica-theme'