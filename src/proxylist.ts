import Promise from 'bluebird';
import { JSDOM } from 'jsdom';
import { get as curlGET } from './curl.js';
import { returnObj } from './spys';

//https://proxy-list.org/english/search.php?search=ssl-no&country=any&type=any&port=any&ssl=any&p1-10
export default function proxyListOrg() {
  return Promise.resolve(
    curlGET('https://proxy-list.org/english/search.php?search=ssl-no&country=any&type=any&port=any&ssl=any&p1')
  ).then((res) => {
    const data = res.data;
    const buildObject: returnObj = {
      proxy: null,
      code: null,
      anonymity: null,
      ssl: null,
      google: null,
      alert: null,
      type: 'http',
      test: null
    };
    const resultWrapper: returnObj[] = [];

    const dom = new JSDOM(data);
    const doc = dom.window.document;
    Array.from(doc.querySelectorAll('ul')).map((ul) => {
      const li = ul.querySelectorAll('li');
      if (li) {
        const proxy = li[0].textContent;
        const extract = /Proxy\(['"](.*)['"]\)/gm.exec(proxy);
        if (Array.isArray(extract) && extract.length > 1) {
          const decode = Buffer.from(extract[1], 'base64').toString('ascii');
          buildObject.proxy = decode;
          const type = li[1].textContent.trim().toLowerCase();
          buildObject.ssl = type == 'https';
          const anonymity = li[3].textContent.trim().toLowerCase();
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
          const location = li[4].querySelector('[class*=flag]');
          buildObject.code = location.classList.toString().replace('flag', '').trim().toUpperCase();
          resultWrapper.push(buildObject);
        }
      }
    });
    return resultWrapper;
  });
}
