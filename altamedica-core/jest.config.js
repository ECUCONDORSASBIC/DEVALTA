// Configuración de Jest optimizada para Micro-frontends Médicos - Altamedica
// Testing + HIPAA compliance + Performance optimization

module.exports = {
  // Configuración básica
  testEnvironment: 'jsdom',
  rootDir: '.',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Configuración de setup
  setupFilesAfterEnv: [
    '<rootDir>/src/test-utils/setup.ts'
  ],
  
  // Module name mapping para micro-frontends
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/shared/(.*)$': '<rootDir>/src/microfrontends/shared/$1',
    '^@/patient-management/(.*)$': '<rootDir>/src/microfrontends/patient-management/$1',
    '^@/appointment-scheduling/(.*)$': '<rootDir>/src/microfrontends/appointment-scheduling/$1',
    '^@/telemedicine/(.*)$': '<rootDir>/src/microfrontends/telemedicine/$1',
    '^@/optimized/(.*)$': '<rootDir>/src/optimized/$1',
    '^@/lazy/(.*)$': '<rootDir>/src/lazy/$1',
    
    // Mock para assets estáticos
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/test-utils/fileMock.js'
  },
  
  // Transform configuration optimizada
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties'
      ]
    }]
  },
  
  // Files to ignore
  transformIgnorePatterns: [
    'node_modules/(?!(date-fns|lucide-react|@headlessui/react)/)'
  ],
  
  // Configuración de cobertura optimizada para médico
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/test-utils/**',
    '!src/**/__tests__/**',
    '!src/**/index.{js,ts}',
    // Incluir micro-frontends específicamente
    'src/microfrontends/**/*.{js,jsx,ts,tsx}',
    'src/optimized/**/*.{js,jsx,ts,tsx}',
    'src/lazy/**/*.{js,jsx,ts,tsx}',
    // Excluir archivos de configuración
    '!src/**/webpack.config.js',
    '!src/**/next.config.js'
  ],
  
  // Umbrales de cobertura específicos para aplicaciones médicas
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    // Umbrales más estrictos para componentes médicos críticos
    'src/microfrontends/patient-management/**/*.{js,jsx,ts,tsx}': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/microfrontends/telemedicine/**/*.{js,jsx,ts,tsx}': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/lib/medical-utils.ts': {
      branches: 95,
      functions: 100,
      lines: 100,
      statements: 100
    },
    'src/optimized/**/*.{js,jsx,ts,tsx}': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Reportes de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Directorio de reportes
  coverageDirectory: '<rootDir>/coverage',
  
  // Configuración de globals para testing médico
  globals: {
    'ts-jest': {
      useESM: true
    },
    // Variables globales para testing médico
    '__MEDICAL_COMPLIANCE_MODE__': 'HIPAA',
    '__ENCRYPTION_ENABLED__': true,
    '__AUDIT_LOGGING__': true,
    '__PERFORMANCE_MONITORING__': false // Desactivado en tests
  },
  
  // Test timeout optimizado para micro-frontends
  testTimeout: 15000, // 15 segundos para cargas de micro-frontends
  
  // Configuración de workers
  maxWorkers: '50%',
  
  // Clear mocks automáticamente
  clearMocks: true,
  restoreMocks: true,
  
  // Configuración de módulos
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],
  
  // Configuración específica para micro-frontends
  projects: [
    // Proyecto principal
    {
      displayName: 'main',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ],
      testPathIgnorePatterns: [
        '<rootDir>/src/microfrontends/'
      ]
    },
    
    // Micro-frontend: Patient Management
    {
      displayName: 'patient-management',
      testMatch: [
        '<rootDir>/src/microfrontends/patient-management/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ],
      setupFilesAfterEnv: [
        '<rootDir>/src/test-utils/setup.ts',
        '<rootDir>/src/test-utils/patient-management-setup.ts'
      ]
    },
    
    // Micro-frontend: Appointment Scheduling
    {
      displayName: 'appointment-scheduling',
      testMatch: [
        '<rootDir>/src/microfrontends/appointment-scheduling/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ],
      setupFilesAfterEnv: [
        '<rootDir>/src/test-utils/setup.ts',
        '<rootDir>/src/test-utils/appointment-setup.ts'
      ]
    },
    
    // Micro-frontend: Telemedicine
    {
      displayName: 'telemedicine',
      testMatch: [
        '<rootDir>/src/microfrontends/telemedicine/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ],
      setupFilesAfterEnv: [
        '<rootDir>/src/test-utils/setup.ts',
        '<rootDir>/src/test-utils/telemedicine-setup.ts'
      ]
    },
    
    // Shared Components
    {
      displayName: 'shared',
      testMatch: [
        '<rootDir>/src/microfrontends/shared/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ],
      setupFilesAfterEnv: [
        '<rootDir>/src/test-utils/setup.ts',
        '<rootDir>/src/test-utils/shared-setup.ts'
      ]
    },
    
    // Optimized Components
    {
      displayName: 'optimized',
      testMatch: [
        '<rootDir>/src/optimized/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ]
    }
  ],
  
  // Reporter personalizado para compliance médico
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/html-report',
      filename: 'medical-test-report.html',
      openReport: false,
      pageTitle: 'Altamedica Medical Test Report',
      logoImgPath: './assets/altamedica-logo.png'
    }],
    ['jest-junit', {
      outputDirectory: './coverage',
      outputName: 'junit.xml',
      suiteName: 'Altamedica Medical Tests'
    }]
  ],
  
  // Configuración de watch mode
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/'
  ],
  
  // Configuración de snapshot
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],
  
  // Custom matchers para testing médico
  setupFilesAfterEnv: [
    '<rootDir>/src/test-utils/setup.ts',
    '<rootDir>/src/test-utils/medical-matchers.ts'
  ],
  
  // Error handling
  errorOnDeprecated: true,
  
  // Configuración de módulos ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Verbose output para debugging
  verbose: process.env.CI ? false : true,
  
  // Configuración específica para CI/CD médico
  ...(process.env.CI && {
    ci: true,
    coverage: true,
    coverageReporters: ['lcov', 'text', 'json-summary'],
    reporters: [
      'default',
      ['jest-junit', {
        outputDirectory: './coverage',
        outputName: 'junit.xml'
      }]
    ],
    maxWorkers: 2,
    testTimeout: 30000 // Más tiempo en CI
  })
}