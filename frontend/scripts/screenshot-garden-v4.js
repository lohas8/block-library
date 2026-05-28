/**
 * 家园页面截图脚本
 * 使用 Playwright 登录后截图验证页面正确加载
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  console.log('1. 访问登录页...');
  await page.goto('http://localhost:3007/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
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
  await page.goto('http://localhost:3007/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);

  console.log('6. 当前 URL:', page.url());

  // 使用 page.content() 获取完整的 HTML 内容
  const html = await page.content();
  console.log('7. HTML 内容长度:', html.length);
  
  // 检测 React root 渲染
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML.substring(0, 200) : 'no root';
  });
  console.log('8. Root 内容:', rootContent);

  // 检测页面是否包含关键元素
  const hasGarden = await page.evaluate(() => document.body.innerText.includes('家园'));
  const hasBuilding = await page.evaluate(() => document.body.innerText.includes('A栋'));
  console.log('9. 包含"家园":', hasGarden);
  console.log('10. 包含"A栋":', hasBuilding);

  // 截图
  const screenshotPath = '/root/.openclaw/workspace/block-library/frontend/docs/mobile-garden-screenshot.jpg';
  await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 85 });
  console.log('📸 截图已保存:', screenshotPath);

  await browser.close();
  console.log('✅ 完成');
})();