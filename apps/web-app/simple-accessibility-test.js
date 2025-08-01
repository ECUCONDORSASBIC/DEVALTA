import { chromium } from 'playwright';
import axe from 'axe-core';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'dashboard', path: '/dashboard' }
];

async function runAccessibilityTests() {
  console.log('🚀 Starting Accessibility Tests...\n');
  
  const browser = await chromium.launch();
  const results = {};
  
  for (const page of PAGES) {
    console.log(`Testing ${page.name}...`);
    
    try {
      const browserPage = await browser.newPage();
      const url = `${BASE_URL}${page.path}`;
      await browserPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Inject axe-core
      await browserPage.addScriptTag({ content: axe.source });
      
      // Run accessibility audit
      const axeResults = await browserPage.evaluate(async () => {
        return await axe.run(document);
      });
      
      // Check touch targets
      const touchTargetIssues = await browserPage.evaluate(() => {
        const clickableElements = document.querySelectorAll('button, a, input, select, textarea');
        const issues = [];
        
        clickableElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if ((rect.width > 0 && rect.width < 44) || (rect.height > 0 && rect.height < 44)) {
            issues.push({
              element: el.tagName.toLowerCase(),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: el.textContent?.slice(0, 30) || ''
            });
          }
        });
        
        return issues;
      });
      
      results[page.name] = {
        url,
        violations: axeResults.violations,
        violationCount: axeResults.violations.length,
        touchTargetIssues,
        status: axeResults.violations.length === 0 && touchTargetIssues.length === 0 ? 'PASS' : 'FAIL'
      };
      
      console.log(`  ✅ ${page.name}: ${results[page.name].violationCount} violations, ${touchTargetIssues.length} touch target issues`);
      
      await browserPage.close();
      
    } catch (error) {
      console.error(`  ❌ Error testing ${page.name}:`, error.message);
      results[page.name] = {
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  await browser.close();
  
  // Save results
  fs.writeFileSync('./accessibility-results.json', JSON.stringify(results, null, 2));
  
  // Summary
  const totalViolations = Object.values(results).reduce((sum, result) => 
    sum + (result.violationCount || 0), 0);
  
  console.log('\n📊 Accessibility Test Summary:');
  console.log(`  Total violations found: ${totalViolations}`);
  console.log(`  Results saved to: accessibility-results.json`);
  
  if (totalViolations > 0) {
    console.log('\n🔧 Top issues to fix:');
    Object.entries(results).forEach(([pageName, result]) => {
      if (result.violations && result.violations.length > 0) {
        console.log(`  ${pageName}:`);
        result.violations.slice(0, 3).forEach(violation => {
          console.log(`    - ${violation.id}: ${violation.description}`);
        });
      }
    });
  }
}

runAccessibilityTests().catch(console.error);
