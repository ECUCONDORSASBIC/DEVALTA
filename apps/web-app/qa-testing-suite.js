import { chromium } from 'playwright';
import axe from 'axe-core';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:3000';
const RESULTS_DIR = './qa-test-results';

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Define breakpoints based on Tailwind config
const BREAKPOINTS = [
  { name: 'xs', width: 475, height: 667 },   // Extra small devices
  { name: 'sm', width: 640, height: 800 },   // Small devices
  { name: 'md', width: 768, height: 1024 },  // Medium devices 
  { name: 'lg', width: 1024, height: 768 },  // Large devices
  { name: 'xl', width: 1280, height: 800 },  // Extra large devices
  { name: '2xl', width: 1536, height: 900 }, // 2X large devices
  { name: '3xl', width: 1920, height: 1080 } // 3X large devices
];

// Define pages to test
const PAGES = [
  { name: 'home', path: '/', title: 'ALTAMEDICA' },
  { name: 'login', path: '/login', title: 'Login' },
  { name: 'register', path: '/register', title: 'Register' },
  { name: 'dashboard', path: '/dashboard', title: 'Dashboard' },
  { name: 'anamnesis-demo', path: '/anamnesis-demo', title: 'Anamnesis' },
  { name: 'anamnesis-hospital', path: '/anamnesis-hospital-demo', title: 'Hospital Demo' },
  { name: 'hospital3d', path: '/hospital3d', title: '3D Hospital' },
];

class QATestingSuite {
  constructor() {
    this.results = {
      responsive: {},
      accessibility: {},
      lighthouse: {},
      keyboard: {},
      summary: {}
    };
  }

  async runFullTestSuite() {
    console.log('🚀 Starting QA Testing Suite...\n');
    
    try {
      // 1. Responsive Design Testing
      console.log('📱 Running Responsive Design Tests...');
      await this.testResponsiveDesign();
      
      // 2. Accessibility Testing
      console.log('♿ Running Accessibility Tests...');
      await this.testAccessibility();
      
      // 3. Lighthouse Performance & Accessibility Audits
      console.log('💡 Running Lighthouse Audits...');
      await this.runLighthouseAudits();
      
      // 4. Keyboard Navigation Testing
      console.log('⌨️ Running Keyboard Navigation Tests...');
      await this.testKeyboardNavigation();
      
      // 5. Generate Summary Report
      console.log('📊 Generating Summary Report...');
      await this.generateSummaryReport();
      
      console.log('✅ QA Testing Suite completed successfully!');
      console.log(`📂 Results saved in: ${RESULTS_DIR}`);
      
    } catch (error) {
      console.error('❌ QA Testing Suite failed:', error);
      throw error;
    }
  }

  async testResponsiveDesign() {
    const browser = await chromium.launch();
    
    for (const page of PAGES) {
      console.log(`  Testing ${page.name}...`);
      this.results.responsive[page.name] = {};
      
      for (const breakpoint of BREAKPOINTS) {
        try {
          const browserPage = await browser.newPage();
          await browserPage.setViewportSize({ 
            width: breakpoint.width, 
            height: breakpoint.height 
          });
          
          const url = `${BASE_URL}${page.path}`;
          await browserPage.goto(url, { waitUntil: 'networkidle' });
          
          // Take screenshot
          const screenshotPath = path.join(RESULTS_DIR, `${page.name}-${breakpoint.name}.png`);
          await browserPage.screenshot({ path: screenshotPath, fullPage: true });
          
          // Check for horizontal scrollbars (overflow issues)
          const hasHorizontalScroll = await browserPage.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          
          // Check for elements that might be cut off
          const elementsOffScreen = await browserPage.evaluate(() => {
            const elements = document.querySelectorAll('*');
            let offScreenCount = 0;
            elements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.right > window.innerWidth) {
                offScreenCount++;
              }
            });
            return offScreenCount;
          });
          
          this.results.responsive[page.name][breakpoint.name] = {
            width: breakpoint.width,
            height: breakpoint.height,
            hasHorizontalScroll,
            elementsOffScreen,
            screenshot: screenshotPath,
            status: hasHorizontalScroll || elementsOffScreen > 0 ? 'FAIL' : 'PASS'
          };
          
          await browserPage.close();
          
        } catch (error) {
          console.error(`    ❌ Error testing ${page.name} at ${breakpoint.name}:`, error.message);
          this.results.responsive[page.name][breakpoint.name] = {
            status: 'ERROR',
            error: error.message
          };
        }
      }
    }
    
    await browser.close();
    
    // Save responsive test results
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'responsive-test-results.json'),
      JSON.stringify(this.results.responsive, null, 2)
    );
  }

  async testAccessibility() {
    const browser = await chromium.launch();
    
    for (const page of PAGES) {
      console.log(`  Testing accessibility for ${page.name}...`);
      
      try {
        const browserPage = await browser.newPage();
        const url = `${BASE_URL}${page.path}`;
        await browserPage.goto(url, { waitUntil: 'networkidle' });
        
        // Inject axe-core
        await browserPage.addScriptTag({ content: axe.source });
        
        // Run axe accessibility audit
        const axeResults = await browserPage.evaluate(async () => {
          return await axe.run(document, {
            rules: {
              'color-contrast': { enabled: true },
              'focus-order-semantics': { enabled: true },
              'aria-labels': { enabled: true },
              'keyboard-navigation': { enabled: true }
            }
          });
        });
        
        // Check for touch targets (minimum 44px)
        const touchTargetIssues = await browserPage.evaluate(() => {
          const clickableElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]');
          const issues = [];
          
          clickableElements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            if ((width > 0 && width < 44) || (height > 0 && height < 44)) {
              issues.push({
                element: el.tagName.toLowerCase(),
                selector: el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase(),
                width: Math.round(width),
                height: Math.round(height),
                text: el.textContent?.slice(0, 50) || ''
              });
            }
          });
          
          return issues;
        });
        
        // Check for motion preferences
        const motionSafetyIssues = await browserPage.evaluate(() => {
          const animatedElements = document.querySelectorAll('[class*="animate"], [style*="animation"], [style*="transition"]');
          const issues = [];
          
          animatedElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const hasMotionSafeClass = el.className.includes('motion-safe') || el.className.includes('motion-reduce');
            
            if (!hasMotionSafeClass && (styles.animation !== 'none' || styles.transition !== 'all 0s ease 0s')) {
              issues.push({
                element: el.tagName.toLowerCase(),
                selector: el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase(),
                hasMotionSafe: hasMotionSafeClass
              });
            }
          });
          
          return issues;
        });
        
        this.results.accessibility[page.name] = {
          axeViolations: axeResults.violations,
          violationCount: axeResults.violations.length,
          touchTargetIssues,
          motionSafetyIssues,
          status: axeResults.violations.length === 0 && touchTargetIssues.length === 0 ? 'PASS' : 'FAIL'
        };
        
        await browserPage.close();
        
      } catch (error) {
        console.error(`    ❌ Error testing accessibility for ${page.name}:`, error.message);
        this.results.accessibility[page.name] = {
          status: 'ERROR',
          error: error.message
        };
      }
    }
    
    await browser.close();
    
    // Save accessibility test results
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'accessibility-test-results.json'),
      JSON.stringify(this.results.accessibility, null, 2)
    );
  }

  async runLighthouseAudits() {
    const chrome = await chromeLauncher.launch({ 
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'] 
    });
    
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['accessibility', 'performance', 'best-practices', 'seo'],
      port: chrome.port,
    };

    for (const page of PAGES) {
      console.log(`  Running Lighthouse audit for ${page.name}...`);
      
      try {
        const url = `${BASE_URL}${page.path}`;
        const runnerResult = await lighthouse(url, options);
        
        if (runnerResult && runnerResult.lhr) {
          const lhr = runnerResult.lhr;
          
          // Save full HTML report
          const htmlOptions = { ...options, output: 'html' };
          const htmlResult = await lighthouse(url, htmlOptions);
          const reportPath = path.join(RESULTS_DIR, `lighthouse-${page.name}.html`);
          fs.writeFileSync(reportPath, htmlResult.report);
          
          // Extract key metrics
          this.results.lighthouse[page.name] = {
            scores: {
              performance: Math.round((lhr.categories.performance?.score || 0) * 100),
              accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
              bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
              seo: Math.round((lhr.categories.seo?.score || 0) * 100)
            },
            metrics: {
              firstContentfulPaint: lhr.audits['first-contentful-paint']?.numericValue,
              largestContentfulPaint: lhr.audits['largest-contentful-paint']?.numericValue,
              cumulativeLayoutShift: lhr.audits['cumulative-layout-shift']?.numericValue,
              totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue
            },
            accessibilityIssues: lhr.audits['color-contrast']?.score < 1,
            reportPath
          };
          
        } else {
          throw new Error('Invalid Lighthouse result');
        }
        
      } catch (error) {
        console.error(`    ❌ Error running Lighthouse for ${page.name}:`, error.message);
        this.results.lighthouse[page.name] = {
          status: 'ERROR',
          error: error.message
        };
      }
    }
    
    await chrome.kill();
    
    // Save lighthouse results
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'lighthouse-results.json'),
      JSON.stringify(this.results.lighthouse, null, 2)
    );
  }

  async testKeyboardNavigation() {
    const browser = await chromium.launch();
    
    for (const page of PAGES) {
      console.log(`  Testing keyboard navigation for ${page.name}...`);
      
      try {
        const browserPage = await browser.newPage();
        const url = `${BASE_URL}${page.path}`;
        await browserPage.goto(url, { waitUntil: 'networkidle' });
        
        // Test Tab navigation
        const focusableElements = await browserPage.evaluate(() => {
          const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
          ].join(', ');
          
          const elements = Array.from(document.querySelectorAll(focusableSelectors));
          return elements.map((el, index) => ({
            tagName: el.tagName,
            type: el.type || null,
            className: el.className || '',
            id: el.id || '',
            tabIndex: el.tabIndex,
            ariaLabel: el.getAttribute('aria-label') || '',
            text: el.textContent?.slice(0, 50) || '',
            hasVisibleFocus: false
          }));
        });
        
        // Test focus indicators
        let focusIssues = [];
        for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
          await browserPage.keyboard.press('Tab');
          
          const focusedElement = await browserPage.evaluate(() => {
            const el = document.activeElement;
            const styles = window.getComputedStyle(el);
            return {
              tagName: el.tagName,
              hasOutline: styles.outline !== 'none',
              hasBoxShadow: styles.boxShadow !== 'none',
              hasFocusVisible: el.matches(':focus-visible')
            };
          });
          
          if (!focusedElement.hasOutline && !focusedElement.hasBoxShadow && !focusedElement.hasFocusVisible) {
            focusIssues.push({
              index: i,
              element: focusedElement.tagName,
              issue: 'No visible focus indicator'
            });
          }
        }
        
        this.results.keyboard[page.name] = {
          focusableElementCount: focusableElements.length,
          focusableElements: focusableElements.slice(0, 5), // Only first 5 for brevity
          focusIssues,
          status: focusIssues.length === 0 ? 'PASS' : 'FAIL'
        };
        
        await browserPage.close();
        
      } catch (error) {
        console.error(`    ❌ Error testing keyboard navigation for ${page.name}:`, error.message);
        this.results.keyboard[page.name] = {
          status: 'ERROR',
          error: error.message
        };
      }
    }
    
    await browser.close();
    
    // Save keyboard test results
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'keyboard-test-results.json'),
      JSON.stringify(this.results.keyboard, null, 2)
    );
  }

  async generateSummaryReport() {
    const summary = {
      testDate: new Date().toISOString(),
      totalPages: PAGES.length,
      totalBreakpoints: BREAKPOINTS.length,
      results: {
        responsive: { pass: 0, fail: 0, error: 0 },
        accessibility: { pass: 0, fail: 0, error: 0 },
        lighthouse: { 
          avgAccessibilityScore: 0, 
          avgPerformanceScore: 0,
          pagesWithIssues: 0 
        },
        keyboard: { pass: 0, fail: 0, error: 0 }
      },
      recommendations: []
    };

    // Analyze responsive results
    Object.values(this.results.responsive).forEach(pageResults => {
      Object.values(pageResults).forEach(result => {
        if (result.status === 'PASS') summary.results.responsive.pass++;
        else if (result.status === 'FAIL') summary.results.responsive.fail++;
        else summary.results.responsive.error++;
      });
    });

    // Analyze accessibility results
    Object.values(this.results.accessibility).forEach(result => {
      if (result.status === 'PASS') summary.results.accessibility.pass++;
      else if (result.status === 'FAIL') summary.results.accessibility.fail++;
      else summary.results.accessibility.error++;
    });

    // Analyze lighthouse results
    const lighthouseScores = Object.values(this.results.lighthouse)
      .filter(result => result.scores)
      .map(result => result.scores);
    
    if (lighthouseScores.length > 0) {
      summary.results.lighthouse.avgAccessibilityScore = Math.round(
        lighthouseScores.reduce((sum, scores) => sum + scores.accessibility, 0) / lighthouseScores.length
      );
      summary.results.lighthouse.avgPerformanceScore = Math.round(
        lighthouseScores.reduce((sum, scores) => sum + scores.performance, 0) / lighthouseScores.length
      );
      summary.results.lighthouse.pagesWithIssues = lighthouseScores.filter(
        scores => scores.accessibility < 90
      ).length;
    }

    // Analyze keyboard results
    Object.values(this.results.keyboard).forEach(result => {
      if (result.status === 'PASS') summary.results.keyboard.pass++;
      else if (result.status === 'FAIL') summary.results.keyboard.fail++;
      else summary.results.keyboard.error++;
    });

    // Generate recommendations
    if (summary.results.responsive.fail > 0) {
      summary.recommendations.push('Fix responsive design issues detected across breakpoints');
    }
    if (summary.results.accessibility.fail > 0) {
      summary.recommendations.push('Address accessibility violations found by axe-core');
    }
    if (summary.results.lighthouse.avgAccessibilityScore < 90) {
      summary.recommendations.push('Improve accessibility score (currently below 90)');
    }
    if (summary.results.keyboard.fail > 0) {
      summary.recommendations.push('Fix keyboard navigation and focus indicator issues');
    }

    this.results.summary = summary;

    // Save summary
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'qa-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    // Generate HTML report
    this.generateHTMLReport(summary);

    // Print summary to console
    console.log('\n📊 QA Testing Summary:');
    console.log(`  Responsive Tests: ${summary.results.responsive.pass} passed, ${summary.results.responsive.fail} failed`);
    console.log(`  Accessibility Tests: ${summary.results.accessibility.pass} passed, ${summary.results.accessibility.fail} failed`);
    console.log(`  Average Lighthouse Accessibility Score: ${summary.results.lighthouse.avgAccessibilityScore}%`);
    console.log(`  Keyboard Tests: ${summary.results.keyboard.pass} passed, ${summary.results.keyboard.fail} failed`);
    
    if (summary.recommendations.length > 0) {
      console.log('\n🔧 Recommendations:');
      summary.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
  }

  generateHTMLReport(summary) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Testing Report - ALTAMEDICA</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #2563eb; }
        .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .pass { color: #059669; font-weight: bold; }
        .fail { color: #dc2626; font-weight: bold; }
        .score { font-size: 24px; font-weight: bold; }
        .recommendations { background: #fef3c7; padding: 15px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; }
        .status-pass { color: #059669; }
        .status-fail { color: #dc2626; }
    </style>
</head>
<body>
    <h1>QA Testing Report - ALTAMEDICA</h1>
    <p>Generated: ${summary.testDate}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">
            <span>Responsive:</span>
            <span class="pass">${summary.results.responsive.pass} passed</span> / 
            <span class="fail">${summary.results.responsive.fail} failed</span>
        </div>
        <div class="metric">
            <span>Accessibility:</span>
            <span class="pass">${summary.results.accessibility.pass} passed</span> / 
            <span class="fail">${summary.results.accessibility.fail} failed</span>
        </div>
        <div class="metric">
            <span>Avg Lighthouse Accessibility:</span>
            <span class="score">${summary.results.lighthouse.avgAccessibilityScore}%</span>
        </div>
        <div class="metric">
            <span>Keyboard Navigation:</span>
            <span class="pass">${summary.results.keyboard.pass} passed</span> / 
            <span class="fail">${summary.results.keyboard.fail} failed</span>
        </div>
    </div>

    ${summary.recommendations.length > 0 ? `
    <div class="recommendations">
        <h3>🔧 Recommendations</h3>
        <ul>
            ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <h2>Detailed Results</h2>
    <p>Check the individual JSON files and Lighthouse HTML reports in the qa-test-results directory for detailed findings.</p>
    
</body>
</html>`;

    fs.writeFileSync(path.join(RESULTS_DIR, 'qa-report.html'), html);
  }
}

// Run the test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new QATestingSuite();
  testSuite.runFullTestSuite().catch(console.error);
}

export default QATestingSuite;
