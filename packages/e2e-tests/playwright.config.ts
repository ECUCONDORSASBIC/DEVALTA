import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  reporter: [['list']]
});
