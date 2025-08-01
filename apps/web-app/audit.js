const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Replace with your web app's URL
  const URL = 'http://localhost:3000';
  await page.goto(URL);

  // Define the pages to visit
  const pages = ['/', '/register', '/login'];

  for (const path of pages) {
    await page.goto(`${URL}${path}`);

    // Capture screenshot
    await page.screenshot({ path: `screenshot-${path.replace('/', '') || 'home'}.png` });
    
    // Export DOM and CSS
    const dom = await page.content();
    require('fs').writeFileSync(`dom-${path.replace('/', '') || 'home'}.html`, dom);

    const cssHandles = await page.$$('style');
    let cssContent = '';
    for (let handle of cssHandles) {
      cssContent += await page.evaluate(el => el.innerHTML, handle);
    }
    require('fs').writeFileSync(`css-${path.replace('/', '') || 'home'}.css`, cssContent);

    // Log sample issues (this part is illustrative, more complex logic needed for real checks)
    const issues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        // Example issue detection
        if (parseFloat(style.zIndex) > 1000) {
          issues.push(`Element ${el.tagName} has high z-index: ${style.zIndex}`);
        }
        if (el.clientWidth > window.innerWidth) {
          issues.push(`Element ${el.tagName} is wider than viewport.`);
        }
      });
      return issues;
    });
    require('fs').writeFileSync(`issues-${path.replace('/', '') || 'home'}.txt`, issues.join('\n'));
  }

  await browser.close();
})();

