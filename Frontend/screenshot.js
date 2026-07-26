import { chromium } from '@playwright/test';

(async () => {
  try {
    console.log('Starting browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('Loading http://localhost:5174...');
    const response = await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    
    if (!response) {
      console.log('No response, trying again...');
      await page.goto('http://localhost:5174', { waitUntil: 'load' });
    }
    
    await page.waitForTimeout(2000);
    
    const screenshotPath = 'screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    await browser.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
