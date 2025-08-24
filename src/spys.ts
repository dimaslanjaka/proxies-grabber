import path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { getPuppeteer } from './utils/puppeteer.js';
import sleep from './utils/sleep.js';
// export { parser as parse, returnObj } from './parser/spys.txt.js';

puppeteer.use(StealthPlugin());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const portMap = {
  Three: 8,
  TwoThreeSix: 7543 ^ 1080,
  ZeroThreeEight: 9065 ^ 80,
  FourThreeTwo: 8237 ^ 8118,
  One: 6,
  One7Five: 9172 ^ 81,
  Five6Three: 6165 ^ 8085,
  OneTwoOne: 2537 ^ 808,
  Eight: 0,
  Nine: 4,
  Two: 9,
  Four: 7,
  Four0Seven: 10487 ^ 6588,
  Five: 1,
  Six: 5,
  Four2Four: 5283 ^ 88,
  Seven: 3,
  Zero: 2,
  EightTwoZero: 9558 ^ 8888,
  OneOneNine: 11230 ^ 9090,
  SixFourTwoSix: 0 ^ (9065 ^ 80), // Eight ^ ZeroThreeEight
  Nine6ZeroOne: 1 ^ (5283 ^ 88), // Five ^ Four2Four
  ThreeEightOneZero: 2 ^ (8237 ^ 8118), // Zero ^ FourThreeTwo
  Nine2Six2: 3 ^ (2537 ^ 808), // Seven ^ OneTwoOne
  Six0FiveFour: 4 ^ (9172 ^ 81), // Nine ^ One7Five
  TwoFiveSevenEight: 5 ^ (7543 ^ 1080), // Six ^ TwoThreeSix
  ZeroTwoEightFive: 6 ^ (11230 ^ 9090), // One ^ OneOneNine
  FourOneFourThree: 7 ^ (9558 ^ 8888), // Four ^ EightTwoZero
  Six4NineSeven: 8 ^ (10487 ^ 6588), // Three ^ Four0Seven
  SevenOneThreeNine: 9 ^ (6165 ^ 8085) // Two ^ Five6Three
};

export interface spysOptions {
  headless?: boolean;
}

/**
 * Scrape proxies from https://spys.one/en/
 *
 * Extracts a list of proxies with their type, anonymity, and country.
 *
 * @param options - Optional settings for browser launch (e.g., headless mode)
 * @returns Array of objects: { proxy, type, anonymity, country }
 */
export async function spysOneBrowser(options: Partial<spysOptions> = {}) {
  const defaultOptions: spysOptions = {
    headless: true
  };
  options = { ...defaultOptions, ...options };
  const { browser } = await getPuppeteer({
    puppeteerOptions: {
      headless: options.headless,
      userDataDir: path.join(process.cwd(), 'tmp', 'profile')
    }
  });
  try {
    const page = await browser.newPage();
    // enableDebug(page);
    await page.goto('https://spys.one/en/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('font.spy14', { timeout: 60000 });
    await sleep(2000);
    const proxies = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr.spy1x, tr.spy1xx'));
      const result: Array<{ proxy: string; type: string; anonymity: string; country: string }> = [];

      for (const row of rows) {
        const tds = row.querySelectorAll('td');
        if (tds.length < 4) continue;

        // 1. Extract IP:PORT (your existing logic)
        const ipPortFont = tds[0].querySelector('font.spy14');
        const ipPort = ipPortFont ? (ipPortFont as HTMLElement).innerText.trim() : '';
        // Optionally, you can use your script logic to get the port if needed

        // 2. Proxy type
        const proxyType = tds[1].innerText.trim();

        // 3. Anonymity
        const anonymity = tds[2].innerText.trim();

        // 4. Country
        // Use querySelector with type assertion to avoid deprecated DOM API
        const countryAcronym = tds[3].querySelector('acronym') as HTMLElement | null;
        const country = countryAcronym ? countryAcronym.innerText.trim() : tds[3].innerText.trim();

        if (ipPort && proxyType && anonymity && country) {
          result.push({
            proxy: ipPort,
            type: proxyType,
            anonymity,
            country
          });
        }
      }

      return result;
    });
    const result = Array.isArray(proxies)
      ? proxies.filter((p) => typeof p.proxy === 'string' && p.proxy.length > 0)
      : [];
    console.log(result);
    return result;
  } finally {
    await browser.close();
  }
}

/**
 * Grab Spys using puppeteer-stealth from https://spys.one/en/
 */
export default async function spys() {
  return await spysOneBrowser({ headless: true });
}

if (process.argv.some((arg) => arg.includes('spys.'))) {
  (async () => {
    const proxies = await spysOneBrowser();
    console.log(proxies);
  })();
}
