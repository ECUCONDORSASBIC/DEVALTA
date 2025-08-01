import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const RESULTS_DIR = './responsive-screenshots';

// Tailwind breakpoints
const BREAKPOINTS = [
  { name: 'xs', width: 475, height: 667 },
  { name: 'sm', width: 640, height: 800 },
  { name: 'md', width: 768, height: 1024 },
  { name: 'lg', width: 1024, height: 768 },
  { name: 'xl', width: 1280, height: 800 },
  { name: '2xl', width: 1536, height: 900 }
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'dashboard', path: '/dashboard' }
];

async function runResponsiveTests() {
  console.log('🚀 Starting Responsive Design Tests...\n');
  
  // Create results directory
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  
  const browser = await chromium.launch();
  const results = {};
  
  for (const page of PAGES) {
    console.log(`Testing ${page.name}...`);
    results[page.name] = {};
    
    for (const breakpoint of BREAKPOINTS) {
      try {
        const browserPage = await browser.newPage();
        await browserPage.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height
        });
        
        const url = `${BASE_URL}${page.path}`;
        await browserPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Take screenshot
        const screenshotPath = path.join(RESULTS_DIR, `${page.name}-${breakpoint.name}.png`);
        await browserPage.screenshot({ path: screenshotPath, fullPage: true });
        
        // Check for horizontal scroll
        const hasHorizontalScroll = await browserPage.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        // Check for elements outside viewport
        const elementsOutsideViewport = await browserPage.evaluate(() => {
          const elements = document.querySelectorAll('*');
          let count = 0;
          elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth && rect.width > 0) {
              count++;
            }
          });
          return count;
        });
        
        // Check text readability at this size
        const textReadabilityIssues = await browserPage.evaluate(() => {
          const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
          const issues = [];
          
          textElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const fontSize = parseFloat(styles.fontSize);
            if (fontSize < 14 && el.textContent.trim().length > 0) {
              issues.push({
                element: el.tagName.toLowerCase(),
                fontSize: fontSize,
                text: el.textContent.slice(0, 50)
              });
            }
          });
          
          return issues;
        });
        
        results[page.name][breakpoint.name] = {
          width: breakpoint.width,
          height: breakpoint.height,
          hasHorizontalScroll,
          elementsOutsideViewport,
          textReadabilityIssues: textReadabilityIssues.length,
          screenshot: screenshotPath,
          status: hasHorizontalScroll || elementsOutsideViewport > 5 ? 'FAIL' : 'PASS'
        };
        
        console.log(`  ${breakpoint.name}: ${results[page.name][breakpoint.name].status} (scroll: ${hasHorizontalScroll}, outside: ${elementsOutsideViewport})`);
        
        await browserPage.close();
        
      } catch (error) {
        console.error(`  ❌ Error testing ${page.name} at ${breakpoint.name}:`, error.message);
        results[page.name][breakpoint.name] = {
          status: 'ERROR',
          error: error.message
        };
      }
    }
  }
  
  await browser.close();
  
  // Save results
  fs.writeFileSync('./responsive-results.json', JSON.stringify(results, null, 2));
  
  // Summary
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  Object.values(results).forEach(pageResults => {
    Object.values(pageResults).forEach(result => {
      totalTests++;
      if (result.status === 'PASS') passedTests++;
      else if (result.status === 'FAIL') failedTests++;
    });
  });
  
  console.log('\\n📊 Responsive Design Test Summary:');
  console.log(`  Total tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${failedTests}`);
  console.log(`  Screenshots saved to: ${RESULTS_DIR}`);
  console.log(`  Results saved to: responsive-results.json`);
  
  if (failedTests > 0) {
    console.log('\\n🔧 Issues found:');
    Object.entries(results).forEach(([pageName, pageResults]) => {
      Object.entries(pageResults).forEach(([breakpoint, result]) => {
        if (result.status === 'FAIL') {
          console.log(`  ${pageName} at ${breakpoint}: ${result.hasHorizontalScroll ? 'horizontal scroll' : ''} ${result.elementsOutsideViewport > 5 ? 'elements outside viewport' : ''}`);
        }
      });
    });
  }
}

runResponsiveTests().catch(console.error);
