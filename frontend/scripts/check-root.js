const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
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

  // Check /mobile
  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 500));
  console.log('Root HTML after /mobile:', rootHTML);
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log('/mobile content:', content.substring(0, 200));
  
  console.log('Errors:', errors.length > 0 ? errors.slice(0, 3) : '无');
  
  await browser.close();
})();
