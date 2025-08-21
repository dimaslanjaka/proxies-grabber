import Promise from 'bluebird';
import { get as curlGET } from './curl.js';
import { returnObj } from './spys';

export default async function sslProxiesOrg() {
  const res = await Promise.resolve(curlGET('http://www.sslproxies.org'));
  const data = res.data;
  const _regex = /[0-9]{1,4}.[0-9]{1,4}.[0-9]{1,4}.[0-9]{1,4}/gm;
  const _regex2 = /[0-9]{1,4}.[0-9]{1,4}.[0-9]{1,4}.[0-9]{1,4}:[0-9]{1,5}/gm;
  const mod = await import('node-html-parser');
  const htmlParser = mod.parse || mod.default || mod;
  const parser = htmlParser(data.toString());
  const objectWrapper: Partial<returnObj>[] = [];
  parser.querySelectorAll('table').map((el) => {
    el.querySelectorAll('tr').map((tr) => {
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
      const td = tr.querySelectorAll('td');
      const proxy = td[0];
      const port = td[1];
      const countryCode = td[2];
      const anonymity = td[4];
      const google = td[5];
      const ssl = td[6];
      if (proxy && /^\d/.test(proxy.rawText)) {
        buildObject.proxy = `${proxy.rawText.trim()}:${port.rawText.trim()}`;
        buildObject.google = /^yes/.test(google.rawText.trim()) ? true : false;
        buildObject.ssl = /^yes/.test(ssl.rawText.trim()) ? true : false;
        buildObject.code = countryCode.rawText.trim();
        switch (anonymity.rawText.trim()) {
          case 'elite proxy':
            buildObject.anonymity = 'H';
            break;
          case 'anonymous':
            buildObject.anonymity = 'A';
            break;
          default:
            buildObject.anonymity = 'N';
            break;
        }
        objectWrapper.push(buildObject);
      }
    });
  });
  return objectWrapper;
}

//export = sslProxiesOrg;
