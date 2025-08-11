import { defineConfig, devices } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:3000';
const PATIENTS_BASE = process.env.PATIENTS_BASE_URL || 'http://localhost:3003';
const DOCTORS_BASE = process.env.DOCTORS_BASE_URL || 'http://localhost:3002';
const COMPANIES_BASE = process.env.COMPANIES_BASE_URL || 'http://localhost:3004';

export default defineConfig({
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    permissions: ['microphone', 'camera'],
    // args para media falsa en Chromium
    launchOptions: {
      args: [
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        // Puedes proveer un archivo de vídeo si lo necesitas:
        // '--use-file-for-fake-video-capture=tests/assets/fake-video.y4m'
      ]
    }
  },
  projects: [
    {
      name: 'api',
      testDir: 'tests',
      testMatch: /.*(health|auth)\.spec\.ts/,
    },
    {
      name: 'web-app',
      use: { baseURL: WEB_BASE, ...devices['Desktop Chrome'] },
      testDir: 'tests',
      testMatch: /.*webapp-.*\.spec\.ts/,
    },
    {
      name: 'patients',
      use: { baseURL: PATIENTS_BASE, ...devices['Desktop Chrome'] },
      testDir: 'tests',
      testMatch: /.*patients-.*\.spec\.ts/,
    },
    {
      name: 'doctors',
      use: { baseURL: DOCTORS_BASE, ...devices['Desktop Chrome'] },
      testDir: 'tests',
      testMatch: /.*doctors-.*\.spec\.ts/,
    },
    {
      name: 'companies',
      use: { baseURL: COMPANIES_BASE, ...devices['Desktop Chrome'] },
      testDir: 'tests',
      testMatch: /.*companies-.*\.spec\.ts/,
    }
  ]
});
