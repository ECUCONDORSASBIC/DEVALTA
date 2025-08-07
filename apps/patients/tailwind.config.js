const { altamedicaTailwindConfig } = require('../../packages/tailwind-config/altamedica-theme')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
    './src/types/**/*.{js,ts,jsx,tsx,mdx}',
    './src/services/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  
  // Extender desde el tema unificado de AltaMedica
  theme: {
    ...altamedicaTailwindConfig.theme,
    extend: {
      ...altamedicaTailwindConfig.theme.extend,
      
      // Configuraciones específicas para Patients
      colors: {
        ...altamedicaTailwindConfig.theme.colors,
        // Colores médicos adicionales específicos para patients
        medical: {
          ...altamedicaTailwindConfig.theme.colors.medical,
          // Colores específicos del cuerpo para historial médico
          blood: '#dc2626',
          heart: '#ef4444',
          brain: '#8b5cf6',
          lung: '#06b6d4',
          bone: '#f59e0b',
          skin: '#fbbf24'
        }
      },
      
      // Breakpoints responsive específicos para patients (incluye más móviles)
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },
      
      // Espaciado específico para patients
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
      
      // Tipografía específica para patients
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
    }
  },
  
  plugins: [
    // Usar plugins del tema unificado
    ...altamedicaTailwindConfig.plugins,
    
    // Plugin adicional específico para Patients
    function({ addUtilities, theme }) {
      const patientsUtilities = {
        '.patient-card': {
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: theme('boxShadow.altamedica'),
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          border: `2px solid ${theme('colors.border.DEFAULT')}`,
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: theme('boxShadow.altamedica-lg'),
            borderColor: theme('colors.primary.300')
          }
        },
        '.patient-button': {
          backgroundColor: theme('colors.primary.500'),
          color: 'white',
          fontWeight: '600',
          borderRadius: '0.75rem',
          padding: '1rem 2rem',
          fontSize: '1rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.primary.600'),
            transform: 'scale(1.03)'
          }
        },
        '.patient-button-success': {
          backgroundColor: theme('colors.success.500'),
          color: 'white',
          fontWeight: '600',
          borderRadius: '0.75rem',
          padding: '1rem 2rem',
          fontSize: '1rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.success.600')
          }
        },
        '.patient-input': {
          border: `2px solid ${theme('colors.border.DEFAULT')}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          fontSize: '1rem',
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}20`
          }
        },
        '.patient-badge': {
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          textTransform: 'uppercase'
        },
        '.patient-appointment-pending': {
          backgroundColor: theme('colors.neutral.100'),
          color: theme('colors.neutral.800'),
          border: `1px solid ${theme('colors.neutral.300')}`
        },
        '.patient-appointment-confirmed': {
          backgroundColor: theme('colors.success.100'),
          color: theme('colors.success.800'),
          border: `1px solid ${theme('colors.success.300')}`
        },
        '.patient-appointment-cancelled': {
          backgroundColor: theme('colors.alert.100'),
          color: theme('colors.alert.800'),
          border: `1px solid ${theme('colors.alert.300')}`
        },
        '.patient-health-excellent': {
          backgroundColor: theme('colors.success.100'),
          color: theme('colors.success.800'),
          border: `2px solid ${theme('colors.success.300')}`
        },
        '.patient-health-good': {
          backgroundColor: theme('colors.primary.100'),
          color: theme('colors.primary.800'),
          border: `2px solid ${theme('colors.primary.300')}`
        },
        '.patient-health-warning': {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '2px solid #fcd34d'
        },
        '.patient-health-critical': {
          backgroundColor: theme('colors.alert.100'),
          color: theme('colors.alert.800'),
          border: `2px solid ${theme('colors.alert.300')}`
        }
      }
      addUtilities(patientsUtilities)
    }
  ]
}