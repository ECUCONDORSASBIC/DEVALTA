import { defineConfig, devices } from '@playwright/test';

/**
 * 🎬 Configuración Playwright VISUAL para SSO Testing
 * Optimizada para ver el flujo de autenticación en acción
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Configuración para testing visual */
  fullyParallel: false,  // Ejecutar secuencialmente para mejor visualización
  forbidOnly: false,
  retries: 0,           // Sin retries para ver errores
  workers: 1,           // Un worker para ver paso a paso
  timeout: 120000,      // 2 minutos por test
  
  /* Reporter detallado */
  reporter: [
    ['list', { printSteps: true }],
    ['html', { 
      outputFolder: 'test-results/visual-report',
      open: 'never'  // No abrir automáticamente
    }]
  ],
  
  /* Configuración para máxima visibilidad */
  use: {
    baseURL: 'http://localhost:3000',
    
    /* Configuración visual */
    headless: false,              // Navegador visible
    slowMo: 1500,                 // 1.5 segundos entre acciones
    
    /* Captura completa */
    trace: 'on',                  // Trace siempre activado
    screenshot: 'only-on-failure', // Screenshots en fallos
    video: 'on',                  // Video siempre
    
    /* Viewport grande para ver todo */
    viewport: { width: 1920, height: 1080 },
    
    /* Headers específicos */
    extraHTTPHeaders: {
      'X-Test-Mode': 'visual-sso',
      'X-Debug': 'enabled'
    }
  },

  /* Solo Chrome para testing visual */
  projects: [
    {
      name: 'visual-sso',
      use: { 
        ...devices['Desktop Chrome'],
        /* Configuraciones específicas para Chrome */
        launchOptions: {
          slowMo: 1500,              // Slow motion habilitado
          devtools: false,           // Sin devtools para no interferir
          args: [
            '--disable-web-security', // Para CORS en desarrollo
            '--disable-features=VizDisplayCompositor',
            '--window-size=1920,1080',
            '--window-position=0,0',
            '--no-first-run',
            '--no-default-browser-check'
          ]
        }
      }
    }
  ],

  /* No usar webServer - conectar a servidores existentes */
  webServer: undefined,
  
  /* Configuración de timeouts */
  expect: {
    timeout: 10000  // 10 segundos para expects
  },
  
  /* Directorio de salida */
  outputDir: './test-results/visual-artifacts',
});