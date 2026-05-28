/**
 * 家园页面截图脚本
 * 使用 Playwright 登录后截图验证页面正确加载
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size

  console.log('1. 访问登录页...');
  await page.goto('http://localhost:3001/mobile/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('2. 填写登录信息...');
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  
  console.log('3. 点击登录按钮...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await page.waitForTimeout(3000);

  console.log('4. 当前 URL:', page.url());

  // 检测是否登录成功
  if (page.url().includes('/mobile/login')) {
    console.log('⚠️ 登录未成功，尝试其他选择器...');
    // 尝试找登录按钮
    const buttons = await page.$$('button');
    console.log(`找到 ${buttons.length} 个按钮`);
    await browser.close();
    return;
  }

  console.log('5. 导航到家园页面...');
  await page.goto('http://localhost:3001/mobile/garden', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('6. 当前 URL:', page.url());

  // 验证页面内容
  const content = await page.evaluate(() => document.body.innerText);
  console.log('7. 页面内容长度:', content.length);
  
  if (content.includes('家园') && content.includes('贡献')) {
    console.log('✅ 页面正确加载：包含"家园"和"贡献"');
  } else {
    console.log('⚠️ 页面内容异常');
    console.log('内容预览:', content.substring(0, 500));
  }

  // 截图
  const screenshotPath = '/root/.openclaw/workspace/block-library/frontend/docs/mobile-garden-screenshot.jpg';
  await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 85, fullPage: false });
  console.log('📸 截图已保存:', screenshotPath);

  await browser.close();
})();