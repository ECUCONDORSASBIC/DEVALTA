/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Paleta de colores médica
      colors: {
        medical: {
          primary: '#006699',
          'primary-dark': '#004466',    // Azul médico principal
          secondary: '#4A90A4',  // Azul claro médico
          accent: '#87CEEB',     // Azul cielo
          success: '#28A745',    // Verde salud
          warning: '#FFC107',    // Amarillo advertencia
          error: '#DC3545',      // Rojo emergencia
          neutral: '#6C757D',    // Gris neutro
          background: '#F8F9FA', // Fondo claro
          surface: '#FFFFFF',    // Superficie blanca
          text: '#212529'        // Texto principal
        },
        hipaa: {
          secure: '#2E7D32',     // Verde seguro HIPAA
          warning: '#F57C00',    // Naranja advertencia
          restricted: '#C62828'  // Rojo restringido
        }
      },
      
      // Tipografía médica
      fontFamily: {
        medical: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      
      // Espaciado médico estándar
      spacing: {
        '18': '4.5rem',   // Para elementos médicos
        '72': '18rem',    // Para paneles
        '84': '21rem',    // Para formularios
        '96': '24rem'     // Para dashboards
      },
      
      // Sombras específicas para UI médica
      boxShadow: {
        'medical': '0 2px 8px 0 rgba(0, 102, 153, 0.1)',
        'patient-card': '0 4px 12px 0 rgba(0, 102, 153, 0.15)',
        'appointment': '0 2px 4px 0 rgba(74, 144, 164, 0.2)',
        'hipaa-secure': '0 0 0 3px rgba(46, 125, 50, 0.2)'
      },
      
      // Bordes médicos
      borderRadius: {
        'medical': '8px',
        'patient-card': '12px'
      },
      
      // Gradientes médicos
      backgroundImage: {
        'medical-gradient': 'linear-gradient(135deg, #006699 0%, #4A90A4 100%)',
        'health-gradient': 'linear-gradient(135deg, #28A745 0%, #20C997 100%)'
      },
      
      // Animaciones médicas
      animation: {
        'pulse-medical': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'slide-in-medical': 'slideInMedical 0.3s ease-out'
      },
      
      keyframes: {
        heartbeat: {
          '0%, 50%, 100%': { transform: 'scale(1)' },
          '25%, 75%': { transform: 'scale(1.1)' }
        },
        slideInMedical: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Plugin personalizado para componentes médicos
    function({ addComponents, theme }) {
      addComponents({
        '.medical-card': {
          backgroundColor: theme('colors.medical.surface'),
          borderRadius: theme('borderRadius.patient-card'),
          boxShadow: theme('boxShadow.patient-card'),
          padding: theme('spacing.6'),
          border: `1px solid ${theme('colors.gray.200')}`
        },
        '.hipaa-secure-input': {
          backgroundColor: theme('colors.medical.surface'),
          border: `2px solid ${theme('colors.hipaa.secure')}`,
          borderRadius: theme('borderRadius.medical'),
          '&:focus': {
            boxShadow: theme('boxShadow.hipaa-secure'),
            outline: 'none'
          }
        },
        '.medical-button': {
          backgroundColor: theme('colors.medical.primary'),
          color: 'white',
          borderRadius: theme('borderRadius.medical'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontWeight: '600',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.medical.secondary'),
            transform: 'translateY(-1px)'
          }
        }
      })
    }
  ],
}
