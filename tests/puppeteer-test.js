// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
puppeteer.use(StealthPlugin());

// puppeteer usage as normal
puppeteer
  .launch({ args: ['--no-sandbox', '--start-maximized'], headless: false, defaultViewport: null, timeout: 0 })
  .then(async (browser) => {
    console.log('Running tests..');
    const page = await browser.newPage();
    await page.goto('https://bot.sannysoft.com');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tmp/testresult.png', fullPage: true });
    await browser.close();
    console.log(`All done, check the screenshot. ✨`);
    browser.on('disconnected', browser.close);
  });
