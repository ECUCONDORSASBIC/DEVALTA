import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e-tests',
  /* Run tests in files in parallel */
  fullyParallel: false, // Secuencial para evitar conflictos de servidor
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: 1, // Un solo worker para evitar conflictos
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'e2e-results/results.json' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshots */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'retain-on-failure',

    /* Global timeout */
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Configuraciones específicas para AltaMedica
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        permissions: ['notifications', 'camera', 'microphone'], // Para telemedicina
      },
    },

    // Descomentar para testing multi-browser
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    //
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'pnpm run start:all-servers',
      port: 3000,
      timeout: 120000, // 2 minutos para levantar todos los servidores
      reuseExistingServer: !process.env.CI,
    }
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e-tests/global-setup.ts'),
  globalTeardown: require.resolve('./e2e-tests/global-teardown.ts'),

  /* Test timeout */
  timeout: 60000, // 1 minuto por test

  /* Expect timeout */
  expect: {
    timeout: 10000
  },

  /* Output directory */
  outputDir: 'e2e-results/',
});