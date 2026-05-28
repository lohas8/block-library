const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 150));
  });

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  // Check /mobile/books
  await page.goto('http://localhost:3000/mobile/books', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  const booksContent = await page.evaluate(() => document.body.innerText);
  console.log('/mobile/books content length:', booksContent.length);
  console.log('Has 图书:', booksContent.includes('图书'));

  // Check /mobile/garden
  await page.goto('http://localhost:3000/mobile/garden', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  const gardenContent = await page.evaluate(() => document.body.innerText);
  console.log('/mobile/garden content length:', gardenContent.length);
  console.log('Has 家园:', gardenContent.includes('家园'));

  // Check /mobile/ai (should show MobileProfile, might be broken)
  await page.goto('http://localhost:3000/mobile/ai', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  const aiContent = await page.evaluate(() => document.body.innerText);
  console.log('/mobile/ai content length:', aiContent.length);
  console.log('Has 用户:', aiContent.includes('用户'));

  console.log('Errors:', errors.length > 0 ? errors.slice(0, 3) : '无');
  
  await browser.close();
})();
