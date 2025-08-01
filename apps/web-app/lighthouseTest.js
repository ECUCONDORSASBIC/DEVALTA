const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

// Define the pages to test
const pages = [
  { name: 'Home', url: 'http://localhost:3000' },
  { name: 'Login', url: 'http://localhost:3000/login' },
  { name: 'Register', url: 'http://localhost:3000/register' },
  { name: 'Dashboard', url: 'http://localhost:3000/dashboard' },
  { name: 'Anamnesis Demo', url: 'http://localhost:3000/anamnesis-demo' },
  { name: 'Hospital Demo', url: 'http://localhost:3000/anamnesis-hospital-demo' },
];

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['accessibility', 'performance', 'best-practices'],
    port: chrome.port,
  };

  for (const page of pages) {
    try {
      console.log(`Running Lighthouse for ${page.name}...`);
      const runnerResult = await lighthouse(page.url, options);

      // Save the report
      const reportHtml = runnerResult.report;
      fs.writeFileSync(`./lighthouse-${page.name.toLowerCase().replace(/\s+/g, '-')}.html`, reportHtml);

      // Log scores
      const lhr = runnerResult.lhr;
      console.log(`${page.name} Scores:`);
      console.log(`  Performance: ${Math.round(lhr.categories.performance.score * 100)}`);
      console.log(`  Accessibility: ${Math.round(lhr.categories.accessibility.score * 100)}`);
      console.log(`  Best Practices: ${Math.round(lhr.categories['best-practices'].score * 100)}`);
      
      // Check for accessibility violations
      const accessibilityAudit = lhr.audits['color-contrast'];
      if (accessibilityAudit && accessibilityAudit.score < 1) {
        console.log(`  ⚠️ Color contrast issues found on ${page.name}`);
      }

    } catch (error) {
      console.error(`Error running Lighthouse for ${page.name}:`, error.message);
    }
  }

  await chrome.kill();
}

runLighthouse().catch(console.error);
