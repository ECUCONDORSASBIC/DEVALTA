import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Asumimos que las aplicaciones están en un directorio 'apps' o similar en la raíz.
// Ajusta esta ruta si es necesario.
const appsDir = path.resolve(__dirname, '../../apps');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Comando para iniciar el servidor de la app de autenticación
    command: 'pnpm --filter @altamedica/web-app dev',
    // URL a esperar antes de que los tests comiencen
    url: 'http://localhost:3000',
    timeout: 120000,
    // Reusar el servidor si ya está corriendo
    reuseExistingServer: !process.env.CI,
    // Directorio desde donde ejecutar el comando
    cwd: path.resolve(__dirname, '../..'),
  },
});
