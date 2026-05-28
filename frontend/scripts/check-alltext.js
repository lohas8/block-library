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
  console.log('Logged in');

  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  const navItems = await page.$$('.nav-item');
  await navItems[1].click();
  await page.waitForTimeout(5000);
  
  // Get body text in different ways
  const bodyText = await page.evaluate(() => document.body.textContent);
  const innerText = await page.evaluate(() => document.body.innerText);
  console.log('body.textContent length:', bodyText?.length, 'first 100:', bodyText?.substring(0, 100));
  console.log('body.innerText length:', innerText?.length);
  
  // Screenshot
  await page.screenshot({ path: '/tmp/garden-check.jpg', type: 'jpeg', quality: 80 });
  console.log('Screenshot saved to /tmp/garden-check.jpg');
  
  await browser.close();
})();
