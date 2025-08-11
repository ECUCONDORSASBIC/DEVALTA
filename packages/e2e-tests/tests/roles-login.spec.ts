import { test, expect, request } from '@playwright/test';
import { loginAndSaveState } from './helpers/auth';

test.describe('@smoke login-redirect-per-role', () => {
  test('patient → redirects to patients dashboard', async ({ page, browser }) => {
    const ctx = await request.newContext();
    await loginAndSaveState(ctx, page, { email: 'patient@test.com', password: 'Test1234!' }, 'storage/patient.json');
    await page.goto('http://localhost:3000/login');
    // Si ya autenticado, middleware/guard redirige
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/localhost:3003\/dashboard/);
  });

  test('doctor → redirects to doctors dashboard', async ({ page }) => {
    const ctx = await request.newContext();
    await loginAndSaveState(ctx, page, { email: 'doctor@test.com', password: 'Test1234!' }, 'storage/doctor.json');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/localhost:3002\/dashboard/);
  });
});
