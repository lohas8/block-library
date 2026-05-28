const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  await page.goto('http://localhost:3000/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);

  console.log('Errors:', errors.length > 0 ? errors : '无错误');
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log('Content length:', content.length);
  console.log('First 200 chars:', content.substring(0, 200));
  
  await browser.close();
})();
