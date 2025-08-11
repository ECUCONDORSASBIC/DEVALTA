import { test, expect, request } from '@playwright/test';
import { loginAndSaveState } from './helpers/auth';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

async function createAppointment(ctx: any) {
  const res = await ctx.post(`${API_BASE}/api/v1/appointments`, {
    data: {
      patientId: 'patient-test-id',
      doctorId: 'doctor-test-id',
      date: new Date(Date.now() + 3600_000).toISOString(),
      reason: 'E2E test appointment',
    },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

test.describe('@e2e patients appointments', () => {
  test('patient can see newly created appointment in UI', async ({ page }) => {
    const ctx = await request.newContext();
    await loginAndSaveState(ctx, page, { email: 'patient@test.com', password: 'Test1234!' }, 'tests/storage/patient.json');

    const appt = await createAppointment(ctx);

    // Navega al dashboard y verifica la cita
    await page.goto('http://localhost:3003/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=E2E test appointment')).toBeVisible({ timeout: 15_000 });
  });
});
