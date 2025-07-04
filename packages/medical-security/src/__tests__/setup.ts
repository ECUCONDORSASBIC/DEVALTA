// Setup para tests del sistema de seguridad médica

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.MEDICAL_ENCRYPTION_KEY = 'test-encryption-key-for-testing-only';

// Configurar timeouts más largos para tests de encriptación
(jest as any).setTimeout(30000);

// Mock de winston para evitar logs durante testing
(jest as any).mock('winston', () => ({
  createLogger: (jest as any).fn(() => ({
    info: (jest as any).fn(),
    error: (jest as any).fn(),
    warn: (jest as any).fn(),
    debug: (jest as any).fn(),
    add: (jest as any).fn()
  })),
  format: {
    combine: (jest as any).fn(),
    timestamp: (jest as any).fn(),
    errors: (jest as any).fn(),
    json: (jest as any).fn(),
    colorize: (jest as any).fn(),
    simple: (jest as any).fn()
  },
  transports: {
    Console: (jest as any).fn(),
    File: (jest as any).fn()
  }
}));

// Mock de winston-daily-rotate-file
(jest as any).mock('winston-daily-rotate-file', () => {
  return (jest as any).fn().mockImplementation(() => ({
    on: (jest as any).fn(),
    emit: (jest as any).fn()
  }));
});

// Configurar console para tests
const originalConsole = { ...console };
beforeAll(() => {
  // Silenciar console.log durante tests
  console.log = (jest as any).fn();
  console.error = (jest as any).fn();
  console.warn = (jest as any).fn();
});

afterAll(() => {
  // Restaurar console original
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

// Limpiar mocks después de cada test
afterEach(() => {
  (jest as any).clearAllMocks();
}); 