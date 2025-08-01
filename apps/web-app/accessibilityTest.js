const axe = require('axe-core');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');

  // Inject axe source into the page
  await page.addScriptTag({ content: `${axe.source}` });

  // Run axe accessibility scan
  const accessibilityScanResults = await page.evaluate(async () => {
    return await axe.run();
  });

  console.log('Accessibility Violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));

  await browser.close();
})();

