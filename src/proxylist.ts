import { JSDOM } from 'jsdom';
import { get as curlGET } from './curl.js';
import { returnObj } from './parser/types.js';

//https://proxy-list.org/english/search.php?search=ssl-no&country=any&type=any&port=any&ssl=any&p1-10
export default async function proxyListOrg() {
  const res = await Promise.resolve(
    curlGET('https://proxy-list.org/english/search.php?search=ssl-no&country=any&type=any&port=any&ssl=any&p1')
  );
  const data = res.data;
  const buildObject: Partial<returnObj> = {
    proxy: undefined,
    code: undefined,
    anonymity: undefined,
    ssl: undefined,
    google: undefined,
    alert: undefined,
    type: 'http',
    test: undefined
  };
  const resultWrapper: returnObj[] = [];
  const dom = new JSDOM(data);
  const doc = dom.window.document;
  Array.from(doc.querySelectorAll('ul')).map((ul) => {
    const li = ul.querySelectorAll('li');
    if (li) {
      const proxy = li[0].textContent;
      if (!proxy) return;
      const extract = /Proxy\(['"](.*)['"]\)/gm.exec(proxy);
      if (Array.isArray(extract) && extract.length > 1) {
        const decode = Buffer.from(extract[1], 'base64').toString('ascii');
        buildObject.proxy = decode;
        const type = li[1]?.textContent?.trim().toLowerCase();
        buildObject.ssl = type == 'https';
        const anonymity = li[3]?.textContent?.trim().toLowerCase();
        switch (anonymity) {
          case 'anonymous':
            buildObject.anonymity = 'A';
            break;
          case 'transparent':
            buildObject.anonymity = 'N';
            break;
          case 'elite':
            buildObject.anonymity = 'H';
            break;
          default:
            buildObject.anonymity = 'N';
            break;
        }
        const location = li[4]?.querySelector('[class*=flag]');
        buildObject.code = location?.classList.toString().replace('flag', '').trim().toUpperCase();
        // Only push if proxy is defined (should always be at this point)
        if (buildObject.proxy) {
          resultWrapper.push({
            proxy: buildObject.proxy,
            code: buildObject.code ?? '',
            anonymity: buildObject.anonymity ?? 'N',
            ssl: buildObject.ssl ?? false,
            google: buildObject.google ?? false,
            alert: buildObject.alert ?? false,
            type: buildObject.type ?? 'http',
            test: typeof buildObject.test === 'string' ? buildObject.test : ''
          });
        }
      }
    }
  });
  return resultWrapper;
}

if (process.argv.some((arg) => arg.includes('proxylist.'))) {
  (async () => {
    const proxies = await proxyListOrg();
    console.log(proxies);
    process.exit(0);
  })();
}
