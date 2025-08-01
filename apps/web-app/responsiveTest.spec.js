const { test, expect } = require('@playwright/test');

// Define the breakpoints to test
const breakpoints = [
  { name: 'sm', width: 640, height: 800 },
  { name: 'md', width: 768, height: 1024 },
  { name: 'lg', width: 1024, height: 768 },
  { name: 'xl', width: 1280, height: 800 },
  { name: '2xl', width: 1536, height: 900 },
];

breakpoints.forEach(({ name, width, height }) => {
  test.describe(`Viewport: ${name}`, () => {
    test.use({ viewport: { width, height } });

    test('should load homepage correctly', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await expect(page).toHaveTitle(/ALTAMEDICA/);
      
      // Add more tests to check layout, elements, etc.
    });
  });
});

