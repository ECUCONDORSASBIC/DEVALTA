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
  theme: {
    extend: {
      // Colores de Altamedica
      colors: {
        // Azul celeste principal
        sky: {
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
        blue: {
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
        
        // Estados médicos
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
      },
      
      // Breakpoints responsive
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },
      
      // Espaciado consistente
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
      
      // Tipografía
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
      
      // Sombras personalizadas
      boxShadow: {
        'altamedica': '0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -4px rgba(14, 165, 233, 0.1)',
        'altamedica-lg': '0 20px 25px -5px rgba(14, 165, 233, 0.1), 0 8px 10px -6px rgba(14, 165, 233, 0.1)',
        'altamedica-xl': '0 25px 50px -12px rgba(14, 165, 233, 0.25)'
      },
      
      // Bordes redondeados
      borderRadius: {
        'xs': '0.125rem',   // 2px
        'sm': '0.25rem',    // 4px
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem'     // 24px
      },
      
      // Transiciones
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
        'slower': '500ms'
      },
      
      // Gradientes personalizados
      backgroundImage: {
        'altamedica': 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        'altamedica-light': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        'altamedica-dark': 'linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 100%)'
      },
      
      // Animaciones personalizadas
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'pulse-altamedica': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-altamedica': 'pulse-altamedica 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  
  plugins: [
    // Plugin para clases de Altamedica
    function({ addUtilities, theme }) {
      const newUtilities = {
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
        },
        '.altamedica-gradient': {
          background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)'
        },
        '.altamedica-card': {
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out'
        },
        '.altamedica-card-hover': {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
          }
        },
        '.altamedica-button': {
          background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
          color: 'white',
          fontWeight: '600',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        },
        '.altamedica-input': {
          border: '2px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: '#0ea5e9',
            boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ]
}