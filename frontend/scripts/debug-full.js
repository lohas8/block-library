const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 100));
  });

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  await page.goto('http://localhost:3000/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);

  console.log('=== 页面信息 ===');
  console.log('URL:', page.url());
  
  // 检查 DOM 结构
  const rootHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML.substring(0, 1000) : 'NO ROOT';
  });
  console.log('Root HTML:', rootHTML);
  
  // 检查所有元素
  const allElements = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const tags = {};
    all.forEach(el => {
      const tag = el.tagName;
      tags[tag] = (tags[tag] || 0) + 1;
    });
    return tags;
  });
  console.log('Element tags:', JSON.stringify(allElements));
  
  console.log('Errors:', errors.length > 0 ? errors : '无');
  
  await browser.close();
})();
