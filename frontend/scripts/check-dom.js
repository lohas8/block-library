const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text().substring(0, 200)}`);
  });
  page.on('pageerror', err => logs.push(`[PAGEERROR] ${err.message.substring(0, 200)}`));

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);
  console.log('Logged in');

  await page.evaluate(() => {
    window.history.pushState({}, '', '/mobile/garden');
  });
  await page.waitForTimeout(3000);
  
  const allLogs = await page.evaluate(() => {
    return window.__console_logs || 'no logs';
  });
  console.log('All logs:', allLogs);
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('Body HTML length:', bodyHTML.length);
  console.log('Body HTML (first 500):', bodyHTML.substring(0, 500));
  
  console.log('All console logs:');
  logs.forEach(l => console.log(' ', l));
  
  await browser.close();
})();
