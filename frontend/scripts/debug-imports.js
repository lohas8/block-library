const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('http://localhost:3000/mobile/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Inject code to check what components are imported
  const checkImports = await page.evaluate(() => {
    try {
      // Check all files that contain 'MobileGarden' or 'MobileProfile'
      const scripts = document.querySelectorAll('script');
      const mainScript = Array.from(scripts).find(s => s.src.includes('main.'));
      if (!mainScript) return 'main script not found';
      return 'found main script at ' + mainScript.src;
    } catch(e) {
      return 'error: ' + e.message;
    }
  });
  console.log('Script check:', checkImports);
  
  // Navigate and immediately check what's imported
  const navItems = await page.$$('.nav-item');
  await navItems[1].click();
  await page.waitForTimeout(1000); // very short wait
  
  const url = page.url();
  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 500));
  const content = await page.evaluate(() => document.body.innerText);
  
  console.log('URL after click:', url);
  console.log('Content after click:', content.substring(0, 100));
  console.log('Root HTML:', rootHTML);
  
  await browser.close();
})();
