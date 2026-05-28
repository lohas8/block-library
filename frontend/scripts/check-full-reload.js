const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 300));
  });

  // Login
  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);
  console.log('Logged in, token:', await page.evaluate(() => localStorage.getItem('token')));

  // Use React router navigation to go to garden (using page.goto with replace)
  await page.evaluate(() => {
    window.history.pushState({}, '', '/mobile/garden');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForTimeout(3000);
  
  let content = await page.evaluate(() => document.body.innerText);
  console.log('After pushState content length:', content.length);
  console.log('Has 家园:', content.includes('家园'));
  console.log('URL:', page.url());

  // Now try window.location change
  await page.evaluate(() => {
    window.history.pushState({}, '', '/mobile/garden');
  });
  await page.waitForTimeout(3000);
  content = await page.evaluate(() => document.body.innerText);
  console.log('After history.pushState content length:', content.length);
  console.log('Has 家园:', content.includes('家园'));
  
  console.log('Errors:', errors.length > 0 ? errors.slice(0, 3) : '无');
  
  // Get root HTML
  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 500));
  console.log('Root HTML:', rootHTML);
  
  await browser.close();
})();
