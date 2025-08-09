// Configuración simple de Playwright para pruebas de autenticación
module.exports = {
  testDir: '.',
  timeout: 60000,
  retries: 0,
  workers: 1,
  use: {
    headless: false, // Ver el navegador
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    baseURL: 'http://localhost:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...require('@playwright/test').devices['Desktop Chrome'],
      },
    },
  ],
};