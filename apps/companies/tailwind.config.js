const { altamedicaTailwindConfig } = require('../../packages/tailwind-config/altamedica-theme')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // Incluir componentes del paquete UI
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  
  theme: {
    // Combinar colores estándar con el tema personalizado
    colors: {
      // Colores base de Tailwind
      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
      
      // Colores estándar de Tailwind
      slate: colors.slate,
      gray: colors.gray,
      zinc: colors.zinc,
      neutral: colors.neutral,
      stone: colors.stone,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.yellow,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
      
      // Sobrescribir con colores personalizados de AltaMedica
      ...altamedicaTailwindConfig.theme.colors,
    },
    
    extend: {
      // Extender todo desde el tema de AltaMedica
      ...altamedicaTailwindConfig.theme.extend,
      
      // Configuraciones específicas para Companies
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      
      // Sombras mejoradas específicas para Companies
      boxShadow: {
        ...altamedicaTailwindConfig.theme.extend.boxShadow,
        'company-card': '0 4px 20px -2px rgba(6, 182, 212, 0.15), 0 8px 25px -5px rgba(0, 0, 0, 0.1)',
        'company-hover': '0 10px 40px -5px rgba(6, 182, 212, 0.25), 0 20px 65px -15px rgba(0, 0, 0, 0.1)',
      },
      
      // Animaciones específicas para Companies
      animation: {
        ...altamedicaTailwindConfig.theme.extend.animation,
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'pulse-altamedica': 'pulseAltamedica 2s infinite',
      },
      
      keyframes: {
        ...altamedicaTailwindConfig.theme.extend.keyframes,
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        pulseAltamedica: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.7)',
          },
          '70%': {
            boxShadow: '0 0 0 10px rgba(6, 182, 212, 0)',
          },
        },
      },
      
      // Gradientes específicos para Companies
      backgroundImage: {
        ...altamedicaTailwindConfig.theme.extend.backgroundImage,
        'company-hero': 'linear-gradient(135deg, rgb(6 182 212) 0%, rgb(34 211 238) 50%, rgb(103 232 249) 100%)',
        'company-card': 'linear-gradient(145deg, rgb(255 255 255) 0%, rgb(248 250 252) 100%)',
        'company-success': 'linear-gradient(135deg, rgb(34 197 94) 0%, rgb(34 197 94) 100%)',
      },
    },
  },
  
  plugins: [
    // Plugins del tema unificado
    ...altamedicaTailwindConfig.plugins,
    
    // Plugin específico para Companies con utilidades mejoradas
    function({ addUtilities, addComponents, theme }) {
      // Componentes específicos para Companies
      const companiesComponents = {
        '.company-card': {
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: theme('boxShadow.company-card'),
          padding: '1.5rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `1px solid ${theme('colors.neutral.200')}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '3px',
            background: `linear-gradient(90deg, ${theme('colors.primary.500')} 0%, ${theme('colors.primary.400')} 100%)`,
            opacity: '0',
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: theme('boxShadow.company-hover'),
            borderColor: theme('colors.primary.300'),
            '&::before': {
              opacity: '1',
            },
          }
        },
        
        '.company-button': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        
        '.company-button-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: 'white',
          boxShadow: `0 4px 14px 0 rgba(6, 182, 212, 0.39)`,
          '&:hover': {
            backgroundColor: theme('colors.primary.600'),
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: `0 8px 25px 0 rgba(6, 182, 212, 0.5)`,
          },
          '&:active': {
            transform: 'translateY(0) scale(1.02)',
          },
        },
        
        '.company-button-success': {
          backgroundColor: theme('colors.success.500'),
          color: 'white',
          boxShadow: `0 4px 14px 0 rgba(34, 197, 94, 0.39)`,
          '&:hover': {
            backgroundColor: theme('colors.success.600'),
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: `0 8px 25px 0 rgba(34, 197, 94, 0.5)`,
          },
        },
        
        '.company-metric-card': {
          background: 'linear-gradient(145deg, rgb(255 255 255) 0%, rgb(248 250 252) 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: `2px solid ${theme('colors.primary.100')}`,
          boxShadow: theme('boxShadow.company-card'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: theme('boxShadow.company-hover'),
            borderColor: theme('colors.primary.300'),
          }
        },
        
        '.company-header': {
          background: `linear-gradient(135deg, ${theme('colors.primary.500')} 0%, ${theme('colors.primary.400')} 50%, ${theme('colors.primary.300')} 100%)`,
          color: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite',
          },
        },
      }
      
      addComponents(companiesComponents)
      
      // Utilidades específicas
      const companiesUtilities = {
        '.text-company-gradient': {
          background: `linear-gradient(135deg, ${theme('colors.primary.600')} 0%, ${theme('colors.primary.400')} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        
        '.company-glow': {
          boxShadow: `0 0 20px ${theme('colors.primary.500')}40, 0 0 40px ${theme('colors.primary.500')}20`,
        },
        
        '.company-focus': {
          outline: 'none',
          boxShadow: `0 0 0 3px ${theme('colors.primary.500')}40`,
        },
        
        '.company-skeleton': {
          background: `linear-gradient(90deg, ${theme('colors.neutral.200')} 25%, ${theme('colors.neutral.100')} 50%, ${theme('colors.neutral.200')} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        },
      }
      
      addUtilities(companiesUtilities)
      
      // Agregar keyframe para shimmer
      addUtilities({
        '@keyframes shimmer': {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
      })
    }
  ],
};
