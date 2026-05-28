const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[ERROR]', msg.text().substring(0, 200));
    if (msg.type() === 'warning') console.log('[WARN]', msg.text().substring(0, 200));
  });

  // We need to check what happens when we navigate FROM /mobile TO /mobile/garden
  // Maybe the issue is in the route transition itself
  
  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  console.log('=== Before clicking 家园 tab ===');
  let rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 200));
  console.log('Root HTML:', rootHTML);
  
  const navItems = await page.$$('.nav-item');
  await navItems[1].click();
  await page.waitForTimeout(2000);  // shorter wait
  
  console.log('=== Immediately after clicking (2s) ===');
  rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 200));
  console.log('Root HTML:', rootHTML);
  
  const divs = await page.$$('div');
  console.log('Div count:', divs.length);
  
  await page.waitForTimeout(5000);  // more wait
  
  console.log('=== After waiting more (7s total) ===');
  rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 200));
  console.log('Root HTML:', rootHTML);
  
  await browser.close();
})();
