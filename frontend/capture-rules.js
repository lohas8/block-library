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

  // zhangsan 登录 -> 积分申请/自评页面
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await removeOverlay();
  await page.fill('input[placeholder="用户名"]', 'zhangsan');
  await page.fill('input[placeholder="密码"]', 'abc123');
  await removeOverlay();
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await removeOverlay();

  await page.goto('http://localhost:3000/apply-rule', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await removeOverlay();
  await page.screenshot({ path: '/tmp/block-selfeval1.png', fullPage: true });
  console.log('Apply rule page done');

  // 点击"自评"按钮
  const selfBtn = page.locator('button:has-text("自评")').first();
  if (await selfBtn.isVisible()) {
    await selfBtn.click();
    await page.waitForTimeout(2000);
    await removeOverlay();
    await page.screenshot({ path: '/tmp/block-selfeval2.png', fullPage: true });
    console.log('Modal opened');
  }

  console.log('All done');
  await browser.close();
})();