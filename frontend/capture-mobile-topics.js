const { chromium } = require('playwright');

const takeScreenshot = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 size

  try {
    // 1. Go to login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 2. Login as zhangsan
    await page.fill('input[placeholder*="用户"]', 'zhangsan');
    await page.fill('input[placeholder*="密码"]', 'xxx');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 3. Navigate to mobile topics (default home)
    await page.goto('http://localhost:3000/mobile', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(3000);

    // 4. Verify we're on the topics page
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check for topics content
    const content = await page.evaluate(() => document.body.innerText);
    console.log('Page has content:', content.length, 'chars');
    console.log('Content preview:', content.substring(0, 200));

    // Wait a bit more for content to load
    await page.waitForTimeout(2000);

    // 5. Take screenshot
    await page.screenshot({
      path: '/root/.openclaw/media/qqbot/downloads/mobile-topics-list.jpg',
      type: 'jpeg',
      quality: 85,
      fullPage: true,
    });
    console.log('Screenshot saved!');
    
  } catch (err) {
    console.error('Error:', err.message);
    const debugImg = '/root/.openclaw/media/qqbot/downloads/mobile-topics-debug.jpg';
    await page.screenshot({ path: debugImg, type: 'jpeg', quality: 70 });
    console.log('Debug screenshot saved to', debugImg);
  } finally {
    await browser.close();
  }
};

takeScreenshot();