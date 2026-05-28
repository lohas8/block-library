const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.message.substring(0, 300)));

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
  console.log('Clicking tab:', await navItems[1].textContent());
  await navItems[1].click();
  await page.waitForTimeout(5000);
  
  console.log('URL:', page.url());
  console.log('Errors:', errors);
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log('Content length:', content.length);
  console.log('Content:', content.substring(0, 300));
  
  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 500));
  console.log('Root HTML:', rootHTML);
  
  await browser.close();
})();
