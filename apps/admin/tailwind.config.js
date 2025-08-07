const { altamedicaTailwindConfig } = require('../../packages/tailwind-config/altamedica-theme')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  
  // Extender desde el tema unificado de AltaMedica
  theme: {
    ...altamedicaTailwindConfig.theme,
    extend: {
      ...altamedicaTailwindConfig.theme.extend,
      
      // Configuraciones específicas para Admin
      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
        '3xl': '1.875rem',    // 30px
        '4xl': '2.25rem',     // 36px
        '5xl': '3rem',        // 48px
        '6xl': '3.75rem',     // 60px
        '7xl': '4.5rem',      // 72px
        '8xl': '6rem',        // 96px
        '9xl': '8rem'         // 128px
      },
      
      // Espaciado específico para Admin
      spacing: {
        'xs': '0.25rem',    // 4px
        'sm': '0.5rem',     // 8px
        'md': '1rem',       // 16px
        'lg': '1.5rem',     // 24px
        'xl': '2rem',       // 32px
        '2xl': '3rem',      // 48px
        '3xl': '4rem',      // 64px
        '4xl': '6rem',      // 96px
        '5xl': '8rem'       // 128px
      },

      // Breakpoints responsive para admin
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },

      // Tipografía específica para admin
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
    }
  },
  
  plugins: [
    // Usar plugins del tema unificado
    ...altamedicaTailwindConfig.plugins,
    
    // Plugin adicional específico para Admin
    function({ addUtilities, theme }) {
      const adminUtilities = {
        '.admin-dashboard-bg': {
          backgroundColor: theme('colors.background.secondary'),
          minHeight: '100vh'
        },
        '.admin-card': {
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: theme('boxShadow.altamedica'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.altamedica-lg')
          }
        },
        '.admin-button': {
          backgroundColor: theme('colors.primary.500'),
          color: 'white',
          fontWeight: '600',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.primary.600'),
            transform: 'scale(1.02)'
          }
        }
      }
      addUtilities(adminUtilities)
    }
  ]
}