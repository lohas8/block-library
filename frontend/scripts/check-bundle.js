const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Track what JS files are loaded
  const jsFiles = [];
  page.on('response', response => {
    if (response.url().includes('.js')) {
      jsFiles.push(response.url().split('/').pop());
    }
  });

  await page.goto('http://localhost:3000/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);

  console.log('JS files loaded:', jsFiles.length);
  jsFiles.forEach(f => console.log('  -', f));
  
  // Check if MobileGarden.js is in the bundle
  const pageContent = await page.content();
  console.log('Has garden-page class:', pageContent.includes('garden-page'));
  console.log('Has 家园 text:', pageContent.includes('家园'));
  console.log('Has MobileGarden:', pageContent.includes('MobileGarden'));
  
  // Check the page HTML
  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 200));
  console.log('Root innerHTML:', rootHtml);
  
  await browser.close();
})();
