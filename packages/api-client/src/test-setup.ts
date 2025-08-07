/**
 * 🧪 TEST SETUP - API CLIENT
 * Configuración inicial para los tests
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de window.fetch global
global.fetch = vi.fn();

// Mock de console para tests más limpios
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Configuración de tests para React Query
import { QueryClient } from '@tanstack/react-query';

// Crear un QueryClient por defecto para tests
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });

// Cleanup después de cada test
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});