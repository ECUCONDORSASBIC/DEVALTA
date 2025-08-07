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
      
      // Configuraciones específicas para Doctors
      colors: {
        ...altamedicaTailwindConfig.theme.colors,
        // Colores médicos adicionales específicos para doctors
        medical: {
          ...altamedicaTailwindConfig.theme.colors.medical,
          // Colores específicos del cuerpo para diagnósticos
          blood: '#dc2626',
          heart: '#ef4444',
          brain: '#8b5cf6',
          lung: '#06b6d4',
          bone: '#f59e0b',
          skin: '#fbbf24',
          // HIPAA y seguridad médica
          secure: '#059669',
          compliance: '#7c3aed'
        }
      },
      
      // Espaciado médico específico
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
      
      // Tipografía médica
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      
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

      // Breakpoints responsive para doctors
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },
    }
  },
  
  plugins: [
    // Usar plugins del tema unificado
    ...altamedicaTailwindConfig.plugins,
    
    // Plugin adicional específico para Doctors
    function({ addUtilities, theme }) {
      const doctorsUtilities = {
        '.doctor-card': {
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: theme('boxShadow.altamedica'),
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          border: `1px solid ${theme('colors.border.DEFAULT')}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.altamedica-lg'),
            borderColor: theme('colors.primary.300')
          }
        },
        '.medical-button': {
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
        },
        '.medical-button-success': {
          backgroundColor: theme('colors.success.500'),
          color: 'white',
          fontWeight: '600',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.success.600')
          }
        },
        '.medical-button-alert': {
          backgroundColor: theme('colors.alert.500'),
          color: 'white',
          fontWeight: '600',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.alert.600')
          }
        },
        '.medical-status-badge': {
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          padding: '0.25rem 0.75rem',
          textAlign: 'center',
          textTransform: 'uppercase'
        },
        '.medical-urgent': {
          backgroundColor: theme('colors.alert.100'),
          color: theme('colors.alert.800'),
          border: `1px solid ${theme('colors.alert.300')}`
        },
        '.medical-routine': {
          backgroundColor: theme('colors.primary.100'),
          color: theme('colors.primary.800'),
          border: `1px solid ${theme('colors.primary.300')}`
        },
        '.medical-healthy': {
          backgroundColor: theme('colors.success.100'),
          color: theme('colors.success.800'),
          border: `1px solid ${theme('colors.success.300')}`
        }
      }
      addUtilities(doctorsUtilities)
    }
  ]
}