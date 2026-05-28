const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  const allLogs = [];
  page.on('console', msg => {
    allLogs.push(`[${msg.type()}] ${msg.text().substring(0, 300)}`);
  });
  page.on('pageerror', err => allLogs.push(`[PAGEERROR] ${err.message.substring(0, 300)}`));

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
  await navItems[1].click();
  await page.waitForTimeout(5000);
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log('Content:', content);
  
  console.log('All logs:');
  allLogs.forEach(l => console.log(l));
  
  await browser.close();
})();
