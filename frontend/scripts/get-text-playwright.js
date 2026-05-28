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
  
  // Use page.textContent() instead of page.evaluate()
  const bodyText = await page.textContent('body');
  console.log('Playwright body textContent:', bodyText?.length, 'first 300:', bodyText?.substring(0, 300));
  
  // Try getting text from specific elements
  const gardenPage = await page.$('.garden-page');
  console.log('.garden-page found:', !!gardenPage);
  
  const mobileLayout = await page.$('.mobile-layout-yishi');
  console.log('.mobile-layout-yishi found:', !!mobileLayout);
  if (mobileLayout) {
    const text = await mobileLayout.textContent();
    console.log('mobile-layout text:', text?.length, text?.substring(0, 200));
  }
  
  // Try looking at specific div
  const divs = await page.$$('div');
  console.log('Total divs:', divs.length);
  
  await browser.close();
})();
