const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  // Navigate to /mobile first
  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Click 家园 tab
  const navItems = await page.$$('.nav-item');
  await navItems[1].click();
  await page.waitForTimeout(5000);
  
  // Get innerHTML of root
  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Root innerHTML length:', rootHTML?.length);
  console.log('Root innerHTML (first 1000):', rootHTML?.substring(0, 1000));
  
  // Get all text
  const allText = await page.evaluate(() => document.documentElement.innerText);
  console.log('Document innerText length:', allText?.length);
  console.log('Document innerText:', allText?.substring(0, 300));
  
  await browser.close();
})();
