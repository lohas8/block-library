const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  console.log('1. 访问登录页...');
  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('2. 填写登录信息...');
  const inputs = await page.$$('input');
  console.log('   找到 input 数量:', inputs.length);
  
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  
  console.log('3. 点击登录按钮...');
  const buttons = await page.$$('button');
  console.log('   找到 button 数量:', buttons.length);
  for (let btn of buttons) {
    const txt = await btn.textContent();
    console.log('   Button:', txt.trim());
  }
  
  // Try to find and click the submit button
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  if (submitBtn) {
    await submitBtn.click();
  }
  await page.waitForTimeout(5000);

  console.log('4. 当前 URL:', page.url());

  console.log('5. 导航到家园页面...');
  await page.goto('http://localhost:3000/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);

  console.log('6. 当前 URL:', page.url());

  const hasGarden = await page.evaluate(() => document.body.innerText.includes('家园'));
  const hasBuilding = await page.evaluate(() => document.body.innerText.includes('A栋'));
  const hasTab = await page.evaluate(() => document.body.innerText.includes('按楼栋'));
  console.log('✅ 包含"家园":', hasGarden);
  console.log('✅ 包含"A栋":', hasBuilding);
  console.log('✅ 包含"按楼栋" Tab:', hasTab);

  const screenshotPath = '/root/.openclaw/workspace/block-library/frontend/docs/mobile-garden-screenshot.jpg';
  await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 85 });
  console.log('📸 截图已保存:', screenshotPath);

  await browser.close();
  console.log('✅ 完成');
})();
