const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 200));
  });

  // Direct to garden WITHOUT login first
  await page.goto('http://localhost:3000/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  console.log('Direct to /mobile/garden - URL:', page.url());
  const content1 = await page.evaluate(() => document.body.innerText);
  console.log('Content length:', content1.length, 'First 100:', content1.substring(0, 100));
  console.log('Errors:', errors.length > 0 ? errors.slice(0, 2) : '无');
  
  await browser.close();
})();
