const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  // Login
  await page.goto('http://localhost:3013/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  const userInput = await page.$('input[placeholder="用户名"]');
  const passInput = await page.$('input[placeholder="密码"]');
  await userInput.fill('admin');
  await passInput.fill('admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);
  console.log('Logged in, URL:', page.url());

  // Navigate to /mobile first
  await page.goto('http://localhost:3013/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('At /mobile');

  // Click 家园 tab (second tab)
  const navItems = await page.$$('.nav-item');
  console.log('Found nav items:', navItems.length);
  for (let i = 0; i < navItems.length; i++) {
    const txt = await navItems[i].textContent();
    console.log(`  ${i}: ${txt.trim()}`);
  }
  
  // Click 家园 tab
  await navItems[1].click();
  await page.waitForTimeout(5000);
  console.log('After clicking 家园, URL:', page.url());
  let content = await page.evaluate(() => document.body.innerText);
  console.log('Content (first 100):', content.substring(0, 100));

  // Now DIRECTLY navigate to /mobile/garden
  await page.goto('http://localhost:3013/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);
  console.log('After page.goto to /mobile/garden, URL:', page.url());
  content = await page.evaluate(() => document.body.innerText);
  console.log('Content (first 100):', content.substring(0, 100));
  
  await browser.close();
})();
