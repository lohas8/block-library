const playwright = require('playwright');
(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  page.setDefaultTimeout(15000);

  const removeOverlay = async () => {
    await page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
    });
  };

  // 1. 用 superadmin 登录
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await removeOverlay();
  await page.fill('input[placeholder="用户名"]', 'superadmin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  await removeOverlay();
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await removeOverlay();
  console.log('URL after login:', page.url());

  // 2. 进 Dashboard 看菜单有没有小区管理
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await removeOverlay();
  await page.screenshot({ path: '/tmp/block-community1.png', fullPage: true });

  // 3. 进小区管理页面
  await page.goto('http://localhost:3000/communities', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await removeOverlay();
  await page.screenshot({ path: '/tmp/block-community2.png', fullPage: true });

  console.log('Done');
  await browser.close();
})();