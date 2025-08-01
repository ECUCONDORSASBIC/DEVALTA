/**
 * Tema de Diseño Altamedica - Sistema Compartido
 * Azul celeste (#0EA5E9) como color principal
 * Diseño responsive consistente en todos los microservicios
 */

// Paleta de colores Altamedica
export const ALTAMEDICA_COLORS = {
  // Azul celeste principal
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Azul celeste principal
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  },
  
  // Azul complementario
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  // Grises médicos
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  
  // Estados
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  // Colores médicos específicos
  medical: {
    blood: '#dc2626',
    heart: '#ef4444',
    brain: '#8b5cf6',
    lung: '#06b6d4',
    bone: '#f59e0b',
    skin: '#fbbf24'
  }
} as const

// Breakpoints responsive
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Espaciado consistente
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem'     // 128px
} as const

// Tipografía
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem'       // 128px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
} as const

// Sombras
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none'
} as const

// Bordes redondeados
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
} as const

// Transiciones
export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  slower: '500ms ease-in-out'
} as const

// Z-index
export const Z_INDEX = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  docked: '10',
  dropdown: '1000',
  sticky: '1100',
  banner: '1200',
  overlay: '1300',
  modal: '1400',
  popover: '1500',
  skipLink: '1600',
  toast: '1700',
  tooltip: '1800'
} as const

// Configuración del tema completo
export const ALTAMEDICA_THEME = {
  colors: ALTAMEDICA_COLORS,
  breakpoints: BREAKPOINTS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  borderRadius: BORDER_RADIUS,
  transitions: TRANSITIONS,
  zIndex: Z_INDEX,
  
  // Configuraciones específicas
  config: {
    name: 'Altamedica',
    version: '1.0.0',
    primaryColor: ALTAMEDICA_COLORS.primary[500],
    brandName: 'ALTAMEDICA',
    logo: '/logo-altamedica.svg',
    favicon: '/favicon-altamedica.ico'
  }
} as const

// Tipos TypeScript
export type AltamedicaColor = typeof ALTAMEDICA_COLORS
export type AltamedicaBreakpoint = keyof typeof BREAKPOINTS
export type AltamedicaSpacing = keyof typeof SPACING
export type AltamedicaTheme = typeof ALTAMEDICA_THEME

// Utilidades de tema
export const themeUtils = {
  /**
   * Obtiene el color primario con variante
   */
  getPrimaryColor: (variant: keyof typeof ALTAMEDICA_COLORS.primary = 500) => {
    return ALTAMEDICA_COLORS.primary[variant]
  },
  
  /**
   * Obtiene el breakpoint como string
   */
  getBreakpoint: (breakpoint: AltamedicaBreakpoint) => {
    return BREAKPOINTS[breakpoint]
  },
  
  /**
   * Obtiene el espaciado como string
   */
  getSpacing: (size: AltamedicaSpacing) => {
    return SPACING[size]
  },
  
  /**
   * Genera clases CSS personalizadas
   */
  generateCustomClasses: () => {
    return {
      '.altamedica-primary': {
        backgroundColor: ALTAMEDICA_COLORS.primary[500],
        color: 'white'
      },
      '.altamedica-primary-hover': {
        backgroundColor: ALTAMEDICA_COLORS.primary[600],
        color: 'white'
      },
      '.altamedica-secondary': {
        backgroundColor: ALTAMEDICA_COLORS.secondary[500],
        color: 'white'
      },
      '.altamedica-gradient': {
        background: `linear-gradient(135deg, ${ALTAMEDICA_COLORS.primary[500]} 0%, ${ALTAMEDICA_COLORS.secondary[500]} 100%)`
      }
    }
  }
}

export default ALTAMEDICA_THEME 