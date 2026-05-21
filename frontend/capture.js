const playwright = require('playwright');
(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/tmp/block-library.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
})();
