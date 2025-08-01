import { vi } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock timers for tests that need them
global.setTimeout = vi.fn(setTimeout);
global.clearTimeout = vi.fn(clearTimeout);
global.setInterval = vi.fn(setInterval);
global.clearInterval = vi.fn(clearInterval);

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Restore console for debugging when needed
(global as any).restoreConsole = () => {
  global.console = originalConsole;
};

// Set up common test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock crypto for consistent test results
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  randomBytes: vi.fn((size: number) => Buffer.alloc(size, 'a')),
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mocked-hash')
  }))
}));

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Global test utilities
global.waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Condition not met within timeout');
};
