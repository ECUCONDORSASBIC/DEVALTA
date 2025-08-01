import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'dashboard', path: '/dashboard' }
];

async function runKeyboardTests() {
  console.log('🚀 Starting Keyboard Navigation Tests...\n');
  
  const browser = await chromium.launch();
  const results = {};
  
  for (const page of PAGES) {
    console.log(`Testing keyboard navigation for ${page.name}...`);
    
    try {
      const browserPage = await browser.newPage();
      const url = `${BASE_URL}${page.path}`;
      await browserPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Find all focusable elements
      const focusableElements = await browserPage.evaluate(() => {
        const focusableSelectors = [
          'a[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex=\"-1\"])'
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
          visible: el.offsetParent !== null
        }));
      });
      
      // Test tab navigation through first 10 elements
      const tabNavigationIssues = [];
      const focusVisibilityIssues = [];
      
      for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
        await browserPage.keyboard.press('Tab');
        
        const currentFocus = await browserPage.evaluate(() => {
          const el = document.activeElement;
          const styles = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          
          return {
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            hasOutline: styles.outline !== 'none',
            hasBoxShadow: styles.boxShadow !== 'none',
            hasFocusVisible: el.matches(':focus-visible'),
            isInViewport: rect.top >= 0 && rect.left >= 0 && 
                         rect.bottom <= window.innerHeight && 
                         rect.right <= window.innerWidth,
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor
          };
        });
        
        // Check if focus is visible
        if (!currentFocus.hasOutline && !currentFocus.hasBoxShadow && !currentFocus.hasFocusVisible) {
          focusVisibilityIssues.push({
            index: i,
            element: currentFocus.tagName,
            id: currentFocus.id,
            className: currentFocus.className,
            issue: 'No visible focus indicator'
          });
        }
        
        // Check if focused element is in viewport
        if (!currentFocus.isInViewport) {
          tabNavigationIssues.push({
            index: i,
            element: currentFocus.tagName,
            issue: 'Focused element not in viewport'
          });
        }
      }
      
      // Test escape key functionality
      await browserPage.keyboard.press('Escape');
      const escapeWorked = await browserPage.evaluate(() => {
        // Check if any modals or dropdowns closed
        const modals = document.querySelectorAll('[role=\"dialog\"], .modal, .dropdown-open');
        return modals.length === 0;
      });
      
      // Test skip links
      const skipLinksFound = await browserPage.evaluate(() => {
        const skipLinks = document.querySelectorAll('a[href^=\"#\"]');
        return Array.from(skipLinks).map(link => ({
          text: link.textContent.trim(),
          href: link.getAttribute('href'),
          visible: link.offsetParent !== null
        }));
      });
      
      // Check for proper heading structure
      const headingStructure = await browserPage.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(headings).map(h => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent.slice(0, 50),
          id: h.id
        }));
      });
      
      results[page.name] = {
        url,
        focusableElementCount: focusableElements.length,
        focusableElements: focusableElements.filter(el => el.visible).slice(0, 5),
        tabNavigationIssues,
        focusVisibilityIssues,
        skipLinksFound,
        headingStructure,
        escapeKeyWorks: escapeWorked,
        status: focusVisibilityIssues.length === 0 && tabNavigationIssues.length === 0 ? 'PASS' : 'FAIL'
      };
      
      console.log(`  ✅ ${page.name}: ${focusableElements.length} focusable elements, ${focusVisibilityIssues.length} focus issues, ${tabNavigationIssues.length} navigation issues`);
      
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
  fs.writeFileSync('./keyboard-results.json', JSON.stringify(results, null, 2));
  
  // Summary
  const totalIssues = Object.values(results).reduce((sum, result) => 
    sum + (result.focusVisibilityIssues?.length || 0) + (result.tabNavigationIssues?.length || 0), 0);
  
  console.log('\\n📊 Keyboard Navigation Test Summary:');
  console.log(`  Total focus/navigation issues: ${totalIssues}`);
  console.log(`  Results saved to: keyboard-results.json`);
  
  if (totalIssues > 0) {
    console.log('\\n🔧 Issues to fix:');
    Object.entries(results).forEach(([pageName, result]) => {
      if (result.focusVisibilityIssues && result.focusVisibilityIssues.length > 0) {
        console.log(`  ${pageName} - Focus visibility issues:`);
        result.focusVisibilityIssues.forEach(issue => {
          console.log(`    - ${issue.element}${issue.id ? '#' + issue.id : ''}: ${issue.issue}`);
        });
      }
      if (result.tabNavigationIssues && result.tabNavigationIssues.length > 0) {
        console.log(`  ${pageName} - Tab navigation issues:`);
        result.tabNavigationIssues.forEach(issue => {
          console.log(`    - ${issue.element}: ${issue.issue}`);
        });
      }
    });
  }
  
  // Report on heading structure
  console.log('\\n📝 Heading Structure Analysis:');
  Object.entries(results).forEach(([pageName, result]) => {
    if (result.headingStructure && result.headingStructure.length > 0) {
      console.log(`  ${pageName}:`);
      result.headingStructure.forEach(heading => {
        console.log(`    H${heading.level}: ${heading.text}`);
      });
    }
  });
}

runKeyboardTests().catch(console.error);
