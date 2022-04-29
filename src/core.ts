import dbl from './db';
import spys, { returnObj } from './spys';
import moment from 'moment';
import sslProxiesOrg from './sslproxies';
import Bluebird from 'bluebird';
import proxyListOrg from './proxylist';
import path from 'upath';
import curl from './curl';
import { shuffle, uniqueArrayByObjectKey } from './utils/array';
const db = new dbl(path.join(process.cwd(), 'databases/proxies'));

/**
 * Proxy Grabber
 */
export default class proxyGrabber {
  /**
   * Time to live
   */
  TTL: number;
  /**
   * Proxy Grabber Constructor
   * @param TTL Time To Live in Day
   */
  constructor(TTL = 1) {
    this.TTL = TTL;
  }
  async method1(force = false): Bluebird<returnObj[]> {
    const lastUpdated = db.exists('/spys/lastUpdated') ? db.get('/spys/lastUpdated') : 100;
    // if spys last grab is more than 1 day
    if (moment().diff(lastUpdated, 'days') > this.TTL || force) {
      const proxies = await spys();
      db.push('/spys/lastUpdated', new Date());
      db.push('/spys/proxies', proxies);
      return proxies;
    }
    return Bluebird.resolve(db.get('/spys/proxies'));
  }

  async method2(force = false): Bluebird<returnObj[]> {
    const lastUpdated = db.exists('/sslProxiesOrg/lastUpdated') ? db.get('/sslProxiesOrg/lastUpdated') : 100;
    if (moment().diff(lastUpdated, 'days') > this.TTL || force) {
      const proxies = await sslProxiesOrg();
      db.push('/sslProxiesOrg/lastUpdated', new Date());
      db.push('/sslProxiesOrg/proxies', proxies);
      return proxies;
    }
    return Bluebird.resolve(db.get('/sslProxiesOrg/proxies'));
  }

  /**
   * https://proxy-list.org grabber
   * @param force force update
   * @returns
   */
  async method3(force = false): Bluebird<returnObj[]> {
    const lastUpdated = db.exists('/proxyListOrg/lastUpdated') ? db.get('/proxyListOrg/lastUpdated') : 100;
    if (moment().diff(lastUpdated, 'days') > this.TTL || force) {
      const proxies = await proxyListOrg();
      db.push('/proxyListOrg/lastUpdated', new Date());
      db.push('/proxyListOrg/proxies', proxies);
      return proxies;
    }
    return Bluebird.resolve(db.get('/proxyListOrg/proxies'));
  }

  /**
   * Get all grabbed proxies
   * @returns
   */
  async get() {
    //return Object.assign(this.method1(), this.method2());
    const proxies = await this.method1();
    const proxies2 = await this.method2();
    const proxies3 = await this.method3();
    return Object.assign(proxies, proxies2, proxies3);
  }

  getDb() {
    return { proxyListOrg: this.method3, sslProxiesOrg: this.method2, spys: this.method1 };
  }

  /**
   * Test proxies from array of {@link returnObj}
   * @param proxies
   * @param dbKey
   * @returns
   */
  testProxies(proxies: Partial<returnObj>[], dbKey?: string) {
    return proxies.map(async (obj) => {
      const result: TestResult = { error: true, proxy: null, message: null, anonymity: null, code: 0 };
      try {
        const res = await curl.testProxy(obj.proxy, 'https://httpbin.org/get', {
          headers: {
            Accept: 'application/json',
          },
        });

        //console.log(res.headers[1]['content-type'] == 'application/json');
        result.error = res.status != 200 && res.headers[1]['content-type'] != 'application/json';
        result.proxy = obj;

        // @todo anonymity test
        const proxyDetections = [
          'HTTP-X-REAL-IP',
          'HTTP-X-FORWARDED-FOR',
          'HTTP-X-PROXY-ID',
          'HTTP-VIA',
          'HTTP-X-FORWARDED-FOR',
          'HTTP-FORWARDED-FOR',
          'HTTP-X-FORWARDED',
          'HTTP-FORWARDED',
          'HTTP-CLIENT-IP',
          'HTTP-FORWARDED-FOR-IP',
          'VIA',
          'X-FORWARDED-FOR',
          'FORWARDED-FOR',
          'X-FORWARDED FORWARDED',
          'CLIENT-IP',
          'FORWARDED-FOR-IP',
          'HTTP-PROXY-CONNECTION',
          'HTTP-XROXY-CONNECTION',
        ];
        // @todo transform all keys to be uppercased
        const headers: { [key: string]: string } = res.data.headers;
        Object.keys(headers).map((key) => {
          headers[key.toUpperCase()] = headers[key];
          delete headers[key];
        });

        const isleaked = proxyDetections.some((h) => typeof headers[h] !== 'undefined');
        const ip = obj.proxy.split(':').map((s) => s.trim())[0];
        //console.log({ proxy: ip, origin: res.data.origin });
        if (res.data.origin != ip) {
          result.anonymity = 'T';
        } else if (isleaked) {
          result.anonymity = 'A';
        } else {
          result.anonymity = 'H';
        }

        obj.test = !result.error ? 'PASSED' : 'FAILED';
        if (typeof dbKey == 'string') db.edit(dbKey, obj, { proxy: obj.proxy });
        return result;
      } catch (e) {
        result.error = true;
        result.proxy = obj;
        result.message = e.message;
        result.code = parseInt(e['code']);
        return result;
      }
    });
  }

  /**
   * Test all grabbed proxies
   * @param limit limit proxies each instance to test (0=unlimited)
   */
  test(limit = 10) {
    const self = this;

    function getProxies() {
      const getProxies = [self.method1(), self.method2(), self.method3()];
      let results: TestResult[] = [];
      return Bluebird.all(getProxies).map(async (proxies, index) => {
        // calculate database key
        let dbKey: string;
        switch (index) {
          case 0:
            dbKey = '/spys/proxies';
            break;
          case 1:
            dbKey = '/sslProxiesOrg/proxies';
            break;
          case 2:
            dbKey = '/proxyListOrg/proxies';
            break;
        }

        if (dbKey) {
          let proxiesToTest = shuffle(uniqueArrayByObjectKey(proxies, 'proxy'));
          if (limit > 0) proxiesToTest = proxiesToTest.slice(0, limit);
          const test = self.testProxies(proxiesToTest, dbKey).map(async (tested) => {
            const result = await tested;
            results = results.concat(result);
            return await Bluebird.all(results);
          });
          await Bluebird.all(test);
          console.log('test', index + 1, 'done');
          return results;
        } else {
          console.log('dbKey not found');
        }
      });
    }

    return getProxies();
  }

  toString() {
    return JSON.stringify(this.get());
  }
}

interface TestResult {
  anonymity: 'T' | 'H' | 'A';
  error: boolean;
  proxy: Partial<returnObj>;
  message?: string;
  code?: number;
}

exports = proxyGrabber;
