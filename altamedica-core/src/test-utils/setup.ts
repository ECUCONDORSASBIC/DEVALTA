// Setup principal para testing médico - Altamedica
// Configuración global de testing con compliance HIPAA

import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { jest } from '@jest/globals'

// Configuración de Testing Library optimizada para aplicaciones médicas
configure({
  testIdAttribute: 'data-testid',
  getElementError: (message, container) => {
    const error = new Error(
      `[MEDICAL-TEST-ERROR] ${message}\n\n${container.innerHTML}`
    )
    error.name = 'TestingLibraryElementError'
    error.stack = null
    return error
  }
})

// Mock de Next.js Router para micro-frontends
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
      },
      isFallback: false,
      isLocaleDomain: true,
      isReady: true,
      isPreview: false
    }
  }
}))

// Mock de Next.js Navigation para App Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  }
}))

// Mock de Module Federation para micro-frontends
jest.mock('@module-federation/nextjs-mf', () => ({
  ModuleFederationPlugin: jest.fn()
}))

// Mock de componentes lazy para testing
jest.mock('@/lazy/LazyMedicalComponent', () => {
  return function MockLazyMedicalComponent({ children, ...props }) {
    return <div data-testid="lazy-medical-component" {...props}>{children}</div>
  }
})

// Mock del sistema de cache médico
jest.mock('@/optimized/cache/MedicalCacheManager', () => ({
  medicalCache: {
    get: jest.fn(),
    set: jest.fn(),
    invalidateByTags: jest.fn(),
    clearAll: jest.fn()
  },
  useMedicalCache: jest.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refetch: jest.fn(),
    invalidate: jest.fn()
  }))
}))

// Mock del monitor de performance médica
jest.mock('@/optimized/MedicalPerformanceMonitor', () => ({
  useMedicalPerformance: jest.fn(() => ({
    metrics: null,
    recordApiCall: jest.fn(),
    startWorkflow: jest.fn(),
    completeWorkflow: jest.fn(),
    recordCacheHit: jest.fn(),
    getMetrics: jest.fn(),
    getAverageApiResponseTime: jest.fn()
  }))
}))

// Mock de Firebase para testing médico
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
  })),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn()
}))

// Mock de crypto para encriptación médica
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-1234-5678-9012'),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn()
    }
  }
})

// Mock de Web APIs para telemedicina
Object.defineProperty(globalThis, 'navigator', {
  value: {
    ...globalThis.navigator,
    mediaDevices: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: jest.fn(() => []),
        getVideoTracks: jest.fn(() => []),
        getAudioTracks: jest.fn(() => [])
      }),
      enumerateDevices: jest.fn().mockResolvedValue([])
    },
    permissions: {
      query: jest.fn().mockResolvedValue({ state: 'granted' })
    }
  },
  writable: true
})

// Mock de Performance Observer
globalThis.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}))

// Mock de intersection Observer para lazy loading
globalThis.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: []
}))

// Mock de ResizeObserver
globalThis.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock de localStorage y sessionStorage para compliance HIPAA
const createStorageMock = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
})

Object.defineProperty(globalThis, 'localStorage', {
  value: createStorageMock()
})

Object.defineProperty(globalThis, 'sessionStorage', {
  value: createStorageMock()
})

// Mock de fetch para APIs médicas
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({
      exito: true,
      datos: {},
      mensaje: 'Mock response',
      timestamp: new Date(),
      trazabilidad: 'mock-trace-id'
    }),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    clone: jest.fn()
  })
)

// Variables globales para testing médico
globalThis.__MEDICAL_COMPLIANCE_MODE__ = 'HIPAA'
globalThis.__ENCRYPTION_ENABLED__ = true
globalThis.__AUDIT_LOGGING__ = true
globalThis.__PERFORMANCE_MONITORING__ = false

// Configuración de timezone para testing de fechas médicas
process.env.TZ = 'America/Argentina/Buenos_Aires'

// Helper para simular datos médicos de testing
globalThis.mockMedicalData = {
  patient: {
    id: 'PAC_000001',
    numeroHistoriaClinica: 'HC2024001',
    nombres: 'Juan Carlos',
    apellidos: 'González',
    tipoDocumento: 'DNI',
    numeroDocumento: '12345678',
    fechaNacimiento: new Date('1980-05-15'),
    genero: 'M',
    estadoCivil: 'CASADO',
    telefono: '+541123456789',
    email: 'juan.gonzalez@email.com',
    direccion: {
      calle: 'Av. Corrientes',
      numero: '1234',
      ciudad: 'Buenos Aires',
      provincia: 'CABA',
      codigoPostal: '1043',
      pais: 'Argentina'
    },
    estadoPaciente: 'ACTIVO',
    consentimientoTratamientoDatos: true,
    fechaConsentimiento: new Date(),
    fechaCreacion: new Date(),
    fechaUltimaActualizacion: new Date()
  },
  
  appointment: {
    id: 'CITA20241201090001',
    pacienteId: 'PAC_000001',
    medicoId: 'MED_000001',
    fechaCita: new Date('2024-12-15T09:00:00.000Z'),
    duracionMinutos: 30,
    tipoCita: 'CONSULTA_GENERAL',
    modalidad: 'PRESENCIAL',
    estado: 'PROGRAMADA',
    motivo: 'Consulta de control general',
    observaciones: 'Paciente refiere estar bien',
    recordatorios: [],
    fechaCreacion: new Date(),
    fechaUltimaModificacion: new Date(),
    creadoPor: 'TEST_USER'
  }
}

// Configuración de timeouts para testing de componentes médicos
jest.setTimeout(15000) // 15 segundos para micro-frontends

// Cleanup después de cada test
afterEach(() => {
  // Limpiar mocks
  jest.clearAllMocks()
  
  // Limpiar storage
  localStorage.clear()
  sessionStorage.clear()
  
  // Limpiar timers
  jest.clearAllTimers()
})

// Setup antes de cada test
beforeEach(() => {
  // Reset console methods
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  
  // Reset performance
  if (globalThis.performance && globalThis.performance.mark) {
    globalThis.performance.mark = jest.fn()
    globalThis.performance.measure = jest.fn()
  }
})

// Cleanup global después de todos los tests
afterAll(() => {
  // Restaurar console
  console.error.mockRestore?.()
  console.warn.mockRestore?.()
  
  // Limpiar timers globales
  jest.clearAllTimers()
  jest.useRealTimers()
})

// Log de configuración completada
console.log('🏥 Medical testing setup completed - HIPAA compliance enabled')