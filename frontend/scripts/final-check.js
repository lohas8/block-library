const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  const errors = [];
  const warnings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 200));
    if (msg.type() === 'warning') warnings.push(msg.text().substring(0, 200));
  });
  page.on('pageerror', err => errors.push(`[PAGEERROR] ${err.message.substring(0, 200)}`));

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);
  console.log('Logged in, URL:', page.url());
  
  // Navigate using React Router Link click instead of page.goto
  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  // Find and click the 家园 tab
  const navItems = await page.$$('.nav-item');
  console.log('Nav items found:', navItems.length);
  for (let i = 0; i < navItems.length; i++) {
    const txt = await navItems[i].textContent();
    console.log(`  Tab ${i}: ${txt.trim()}`);
  }
  
  // Click 家园 tab (index 1)
  await navItems[1].click();
  await page.waitForTimeout(5000);
  console.log('After clicking 家园 URL:', page.url());
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log('Content length:', content.length);
  console.log('Content:', content.substring(0, 300));
  
  console.log('Errors:', errors.length > 0 ? errors.slice(0, 3) : '无');
  console.log('Warnings:', warnings.length > 0 ? warnings.slice(0, 3) : '无');
  
  // Take screenshot
  const screenshotPath = '/root/.openclaw/workspace/block-library/frontend/docs/mobile-garden-screenshot.jpg';
  await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 85 });
  console.log('Screenshot saved');
  
  await browser.close();
})();
