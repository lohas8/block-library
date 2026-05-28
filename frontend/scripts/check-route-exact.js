const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 200));
  });

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  const navItems = await page.$$('.nav-item');
  
  // Test: click the AI tab first
  await navItems[2].click();
  await page.waitForTimeout(5000);
  console.log('After AI tab URL:', page.url());
  let content = await page.evaluate(() => document.body.innerText);
  console.log('AI content (first 100):', content.substring(0, 100));
  
  // Now click 家园 tab
  await navItems[1].click();
  await page.waitForTimeout(5000);
  console.log('After 家园 tab URL:', page.url());
  content = await page.evaluate(() => document.body.innerText);
  console.log('家园 content (first 100):', content.substring(0, 100));
  
  console.log('Errors:', errors.slice(0, 5));
  
  await browser.close();
})();
