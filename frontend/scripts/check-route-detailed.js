const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  // Monitor responses
  page.on('response', resp => {
    if (resp.status() >= 400) console.log('HTTP', resp.status(), resp.url());
  });

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);
  console.log('After login URL:', page.url());

  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Intercept ALL route changes
  let routeChanges = [];
  await page.exposeFunction('onRouteChange', (url) => {
    routeChanges.push(url);
  });
  
  // Click the garden tab
  const gardenTab = await page.$('.nav-item:nth-child(2)');
  console.log('Clicking garden tab...');
  
  // Set up URL observer before clicking
  page.on('urlchange', url => {
    console.log('URL changed to:', url);
  });
  
  await gardenTab.click();
  await page.waitForTimeout(5000);
  
  const url = page.url();
  const content = await page.evaluate(() => document.body.innerText);
  
  console.log('Final URL:', url);
  console.log('Content:', content.substring(0, 200));
  console.log('Route changes:', routeChanges);
  
  await browser.close();
})();
