import { test, expect } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:3000';

test.describe('@smoke web-app', () => {
  test('home loads and shows basic elements', async ({ page }) => {
    await page.goto(WEB_BASE);
    await expect(page).toHaveTitle(/AltaMedica|Alta Médica|Web App/i);
    // Check header/footer components exist if present
    await expect(page.locator('header')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('footer')).toBeVisible({ timeout: 10_000 });
  });
});
