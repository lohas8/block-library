const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3017';
  const results = [];
  
  async function login() {
    await page.goto(`${baseUrl}/mobile/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.$eval('input[placeholder="用户名"]', el => el.value = 'admin').catch(() => {});
    await page.$eval('input[placeholder="密码"]', el => el.value = 'admin123').catch(() => {});
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill('admin');
      await inputs[1].fill('admin123');
    }
    const btn = await page.$('button[type="submit"]') || await page.$('button');
    if (btn) await btn.click();
    await page.waitForTimeout(3000);
  }
  
  async function capture(name, path) {
    try {
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 12000 });
      await page.waitForTimeout(1500);
      const screenshotPath = `/root/.openclaw/workspace/block-library/frontend/docs/${name}.png`;
      await page.screenshot({ path: screenshotPath, type: 'png', fullPage: false });
      results.push({ name, path: screenshotPath });
      console.log(`✓ ${name}`);
    } catch (e) {
      console.log(`✗ ${name}: ${e.message}`);
    }
  }
  
  console.log('登录中...');
  await login();
  
  console.log('开始截图...');
  await capture('mobile-login', '/mobile/login');
  await capture('mobile-garden', '/mobile/garden');
  await capture('mobile-square', '/mobile/square');
  await capture('mobile-profile', '/mobile/profile');
  await capture('mobile-topics', '/mobile/topics');
  
  await browser.close();
  
  console.log('\n=== 截图结果 ===');
  results.forEach(r => console.log(`${r.name}: ${r.path}`));
})();
