import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import { parser } from './parser/spys.txt.js';
import sleep from './utils/sleep.js';
export { parser as parse, returnObj as returnObj } from './parser/spys.txt.js';

puppeteer.use(StealthPlugin());

const _portScript = `
Three = 8;
TwoThreeSix = 7543 ^ 1080;
ZeroThreeEight = 9065 ^ 80;
FourThreeTwo = 8237 ^ 8118;
One = 6;
One7Five = 9172 ^ 81;
Five6Three = 6165 ^ 8085;
OneTwoOne = 2537 ^ 808;
Eight = 0;
Nine = 4;
Two = 9;
Four = 7;
Four0Seven = 10487 ^ 6588;
Five = 1;
Six = 5;
Four2Four = 5283 ^ 88;
Seven = 3;
Zero = 2;
EightTwoZero = 9558 ^ 8888;
OneOneNine = 11230 ^ 9090;
SixFourTwoSix = Eight ^ ZeroThreeEight;
Nine6ZeroOne = Five ^ Four2Four;
ThreeEightOneZero = Zero ^ FourThreeTwo;
Nine2SixTwo = Seven ^ OneTwoOne;
Six0FiveFour = Nine ^ One7Five;
TwoFiveSevenEight = Six ^ TwoThreeSix;
ZeroTwoEightFive = One ^ OneOneNine;
FourOneFourThree = Four ^ EightTwoZero;
Six4NineSeven = Three ^ Four0Seven;
SevenOneThreeNine = Two ^ Five6Three;
`;

/**
 * Scrape proxies from https://spys.one/en/
 * @returns Array of proxies in IP:PORT format
 */
export async function spysOneBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox'],
    userDataDir: path.join(process.cwd(), 'tmp', 'profile')
  });
  try {
    const page = await browser.newPage();
    await page.goto('https://spys.one/en/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('table');
    await sleep(2000);
    const proxies = await page.evaluate(() => {
      // Use classic selector for spys.one proxy rows
      const rows = Array.from(document.querySelectorAll('tr'));
      const result = [];
      for (const row of rows) {
        // Check if the row has IP address
        const textContent = row.textContent?.trim() || '';
        console.log('Skipping row without IP address:', textContent);
        if (!textContent.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/)) {
          console.log('Skipping row without IP address:', textContent);
          continue;
        }
        const ipCell = row.querySelector('td');
        if (!ipCell) continue;
        const ip = ipCell.textContent?.trim() || '';
        let port = '';
        // Check for script tag in the next sibling cell (port)
        const portCell = ipCell.parentElement?.nextElementSibling;
        if (portCell) {
          const portScript = portCell.querySelector('script');
          if (portScript && portScript.textContent) {
            try {
              const portScriptText = portScript.textContent.trim();
              const match = portScriptText.match(/^document\.write\((.+)\);?$/);
              if (match) {
                port = eval(match[1]);
              } else {
                port = '';
              }
            } catch (_e) {
              port = '';
            }
          } else {
            port = portCell.textContent?.replace(/[^0-9]/g, '').trim() || '';
          }
        }
        if (ip && port) {
          result.push(`${ip}:${port}`);
        }
      }
      return result;
    });
    const result = Array.isArray(proxies) ? proxies.filter((p) => typeof p === 'string' && p.length > 0) : [];
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
  const proxies = await spysOneBrowser();
  // parser expects a string, join proxies with newlines
  const filtered = proxies.filter((p) => typeof p === 'string' && p.length > 0);
  return parser(filtered.join('\n'));
}

if (process.argv.some((arg) => arg.includes('spys.'))) {
  (async () => {
    const proxies = await spysOneBrowser();
    console.log(proxies);
    process.exit(0);
  })();
}
