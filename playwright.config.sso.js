// playwright.config.sso.js
// Configuración específica para test SSO sin webserver

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  testMatch: 'test-sso-flow.spec.js',
  
  // Timeout para cada test - 1 minuto
  timeout: 60 * 1000,
  
  // Timeout global para todo el test suite - 5 minutos
  globalTimeout: 5 * 60 * 1000,
  
  // No usar webserver ya que los servicios ya están corriendo
  use: {
    // Base URL para las pruebas
    baseURL: 'http://localhost:3000',
    
    // Trazar acciones para debugging
    trace: 'on-first-retry',
    
    // Screenshots en caso de falla
    screenshot: 'only-on-failure',
    
    // Video opcional
    video: 'retain-on-failure',
    
    // Opciones del navegador
    headless: false, // Mostrar navegador
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Timeouts - 1 minuto para todas las acciones
    actionTimeout: 60000,      // 1 minuto para acciones individuales
    navigationTimeout: 60000,   // 1 minuto para navegación
  },
  
  // Expect timeout - 1 minuto
  expect: {
    timeout: 60000
  },
  
  // Configuración de proyectos
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // Reporter
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-sso' }]
  ],
  
  // Configuración de reintentos
  retries: 0,
  
  // Ejecutar tests en paralelo
  workers: 1,
  
  // Output folder
  outputDir: 'test-results-sso/',
});