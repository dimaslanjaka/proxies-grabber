import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import sleep from './utils/sleep.js';
import axios from 'axios';

export default function sslproxies_browser() {
  return new Promise((resolve, reject) => {
    puppeteer
      .launch({ args: ['--no-sandbox', '--start-maximized'], headless: false, defaultViewport: null, timeout: 0 })
      .then(async (browser) => {
        // browser.on('disconnected', browser.close);
        console.log('Running tests..');
        const page = await browser.newPage();
        // await page.goto('https://bot.sannysoft.com');
        await page.goto('https://www.sslproxies.org/');
        await page
          .waitForSelector('body table')
          .then(() => console.log('<body/> visible'))
          .catch(reject);
        console.log('execute js string');
        const scriptContent = fs.readFileSync(
          path.join(
            path.dirname(new URL(import.meta.url).pathname),
            '../packages/php-proxy-hunter/userscripts/sslproxies.js'
          ),
          'utf-8'
        );
        await page.evaluate(scriptContent);
        await page
          .waitForSelector('button#php-proxy-hunter-grab-proxy')
          .then(() => console.log('parser button visible'))
          .catch(reject);
        await page
          .evaluate(function () {
            document.querySelector('button#php-proxy-hunter-grab-proxy').click();
          })
          .catch(reject);
        sleep(5000);
        let current_page = await getActivePage(browser, 30);
        let ix = 0;
        while (!current_page) {
          ix++;
          current_page = await getActivePage(browser, 30);
          if (ix > 3) break;
        }

        let result = null;

        if (current_page) {
          result = await current_page.content();
          // Custom cookies
          const cookies = {
            __ga: 'value_of__ga_cookie',
            _ga: 'value_of__ga_cookie'
          };

          // Convert cookies object to string
          const cookieString = Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');

          axios
            .post('http://sh.webmanajemen.com/proxyAdd.php', new URLSearchParams({ proxies: result }), {
              withCredentials: true,
              headers: {
                Cookie: cookieString
              }
            })
            // .then((res) => {
            //   console.log(res.data);
            // })
            .catch(() => {
              //
            });
        }

        await browser.close();

        resolve(result);
      })
      .catch(reject);
  });
}

/**
 *
 * @param {puppeteer.Browser} browser
 * @param {number} timeout
 * @returns
 */
async function getActivePage(browser, timeout) {
  var start = new Date().getTime();
  while (new Date().getTime() - start < timeout) {
    var pages = await browser.pages();
    var arr = [];
    for (const p of pages) {
      if (
        await p.evaluate(() => {
          return document.visibilityState.trim() == 'visible';
        })
      ) {
        arr.push(p);
      }
    }
    if (arr.length == 1) return arr[0];
  }
  // console.log('Unable to get active page');
}
