const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  console.log('1. 访问登录页...');
  await page.goto('http://localhost:3006/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('2. 填写登录信息...');
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  
  console.log('3. 点击登录按钮...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await page.waitForTimeout(4000);

  console.log('4. 当前 URL:', page.url());

  console.log('5. 导航到家园页面...');
  await page.goto('http://localhost:3006/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);

  console.log('6. 当前 URL:', page.url());

  // 使用 page.evaluate 获取页面内容
  const hasGarden = await page.evaluate(() => document.body.innerText.includes('家园'));
  const hasBuilding = await page.evaluate(() => document.body.innerText.includes('A栋'));
  const hasTab = await page.evaluate(() => document.body.innerText.includes('按楼栋'));
  console.log('✅ 包含"家园":', hasGarden);
  console.log('✅ 包含"A栋":', hasBuilding);
  console.log('✅ 包含"按楼栋" Tab:', hasTab);

  // 截图
  const screenshotPath = '/root/.openclaw/workspace/block-library/frontend/docs/mobile-garden-screenshot.jpg';
  await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 85 });
  console.log('📸 截图已保存:', screenshotPath);

  await browser.close();
  console.log('✅ 完成');
})();
