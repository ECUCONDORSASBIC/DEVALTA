import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'tests/utils/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    },
    reporters: ['default', 'json', 'html', 'junit'],
    outputFile: {
      json: './test-results/json-results.json',
      html: './test-results/html-results.html',
      junit: './test-results/junit-results.xml'
    },
    setupFiles: ['./tests/setup.ts'],
    watchExclude: ['**/node_modules/**', '**/dist/**'],
    testNamePattern: /.*/,
    onConsoleLog: (log, type) => {
      if (type === 'stderr' && log.includes('ExperimentalWarning')) {
        return false;
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@config': path.resolve(__dirname, './config'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});
