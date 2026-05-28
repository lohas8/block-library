const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 200));
  });

  // Login
  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);
  console.log('After login URL:', page.url());

  // Now navigate to /mobile which shows MobileHome (works)
  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('Mobile home URL:', page.url());
  let content = await page.evaluate(() => document.body.innerText);
  console.log('Home content length:', content.length, 'Has 议事:', content.includes('议事'));

  // Find and click the 家园 tab
  const tabs = await page.$$('.nav-item');
  console.log('Found nav tabs:', tabs.length);
  for (let tab of tabs) {
    const txt = await tab.textContent();
    console.log('  Tab:', txt.trim());
  }
  
  // Click the garden tab (should be index 1)
  if (tabs.length >= 2) {
    await tabs[1].click();
    await page.waitForTimeout(3000);
    console.log('After clicking tab URL:', page.url());
    content = await page.evaluate(() => document.body.innerText);
    console.log('Garden content length:', content.length);
    console.log('Has 家园:', content.includes('家园'));
  }

  console.log('Errors:', errors.length > 0 ? errors.slice(0, 2) : '无');
  await browser.close();
})();
