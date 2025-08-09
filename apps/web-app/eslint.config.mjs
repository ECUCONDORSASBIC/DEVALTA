// ESLint configuración simple para evitar errores de compatibilidad
export default [
  {
    ignores: [
      '.next/**',
      'out/**', 
      'build/**',
      'dist/**',
      'node_modules/**',
      'lib/**',
      '**/*.backup.*',
      '*.config.js'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Solo reglas básicas que funcionen
      'no-console': 'off',
      'no-unused-vars': 'off'
    }
  }
];
