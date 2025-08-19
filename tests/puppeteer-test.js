// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import puppeteer from 'puppeteer-extra';
// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

// puppeteer usage as normal
const run = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--start-maximized'],
    headless: false,
    defaultViewport: null,
    timeout: 0
  });
  try {
    console.log('Running tests..');
    const page = await browser.newPage();
    await page.goto('https://bot.sannysoft.com');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tmp/testresult.png', fullPage: true });
    console.log(`All done, check the screenshot. ✨`);
  } finally {
    await browser.close();
  }
  browser.on('disconnected', browser.close);
};

run();
