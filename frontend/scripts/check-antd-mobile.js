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

  // Check /mobile first (works)
  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Inject code to check what antd-mobile exports
  const checkResult = await page.evaluate(() => {
    try {
      const antdMobile = window.__ANTD_MOBILE__ || window.antdMobile;
      return { hasAntdMobile: !!antdMobile, keys: antdMobile ? Object.keys(antdMobile).slice(0, 20) : [] };
    } catch(e) {
      return { error: e.message };
    }
  });
  console.log('Antd Mobile check:', JSON.stringify(checkResult));
  
  // Check what Card is in the bundle
  const cardCheck = await page.evaluate(() => {
    // Try to find Card in the bundle source
    const scripts = document.querySelectorAll('script');
    return { scriptCount: scripts.length };
  });
  console.log('Card check:', cardCheck);
  
  await browser.close();
})();
