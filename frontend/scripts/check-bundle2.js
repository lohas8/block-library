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

  // Try page.evaluate to see what routes are registered
  const routes = await page.evaluate(() => {
    // Try to access React Router context
    const html = document.body.innerHTML;
    return {
      htmlLength: html.length,
      html: html.substring(0, 300)
    };
  });
  console.log('Routes check:', JSON.stringify(routes));
  
  await browser.close();
})();
