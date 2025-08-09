// Tailwind config simplificado usando el preset unificado
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../packages/tailwind-config/unified-preset')],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  plugins: [
    // Plugin específico (antes enorme) reducido a sólo utilidades propias diferenciales
    function({ addUtilities, theme }) {
      addUtilities({
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
        '.medical-status-badge': {
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          padding: '0.25rem 0.75rem',
          textAlign: 'center',
          textTransform: 'uppercase'
        }
      })
    }
  ]
}