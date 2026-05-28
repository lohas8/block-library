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
  console.log('Logged in, URL:', page.url());

  // Navigate to /mobile first
  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('At /mobile, URL:', page.url());
  
  // Now use router navigation to go to garden
  await page.evaluate(() => {
    window.history.pushState({}, '', '/mobile/garden');
  });
  await page.waitForTimeout(500);
  console.log('After pushState, URL:', page.url());
  
  // Dispatch popstate event to trigger React Router
  await page.evaluate(() => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForTimeout(3000);
  console.log('After popstate, URL:', page.url());
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log('Content length:', content.length);
  console.log('Content:', content.substring(0, 200));
  
  await browser.close();
})();
