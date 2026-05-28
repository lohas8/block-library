const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  // 1. 访问登录页
  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  // 2. 登录
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  console.log('登录后 URL:', page.url());

  // 3. 检查 token 是否保存
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token:', token ? '存在' : '不存在');

  // 4. 导航到家园页面
  await page.goto('http://localhost:3000/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);

  console.log('家园页 URL:', page.url());

  // 5. 检查页面内容
  const content = await page.evaluate(() => document.body.innerText);
  console.log('页面内容长度:', content.length);
  
  const hasGarden = content.includes('家园');
  const hasBuilding = content.includes('A栋');
  console.log('包含"家园":', hasGarden);
  console.log('包含"A栋":', hasBuilding);
  
  // 6. 截图
  const screenshotPath = '/root/.openclaw/workspace/block-library/frontend/docs/mobile-garden-screenshot.jpg';
  await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 85, fullPage: false });
  console.log('截图已保存:', screenshotPath);
  
  const fs = require('fs');
  console.log('截图大小:', fs.statSync(screenshotPath).size, 'bytes');

  await browser.close();
  console.log('✅ 完成');
})();
