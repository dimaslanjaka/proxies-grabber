import got, { OptionsOfTextResponseBody } from 'got';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

type ObjectAlias = object;
type GotConfigShadow = OptionsOfTextResponseBody &
  ObjectAlias & {
    [key: string]: any;
  };
function gotDefault(url: string): GotConfigShadow {
  return {
    url,
    maxRedirects: 5,
    timeout: { request: 60 * 1000 },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      Referer: 'http://google.com/crawler'
    },
    retry: { limit: 0 },
    responseType: 'text',
    decompress: true
  };
}

export async function get(url: string, options?: GotConfigShadow) {
  const opt = ObjectReplaceFrom(gotDefault(url), options);
  // Proxy/agent support
  if (opt.proxy) {
    const proxyUrl = opt.proxy;
    if (typeof opt.url === 'string' && opt.url.startsWith('https://')) {
      opt.agent = { https: new HttpsProxyAgent(proxyUrl) };
    } else {
      opt.agent = { http: new HttpProxyAgent(proxyUrl) };
    }
    delete opt.proxy;
  }
  try {
    const res = await got(opt);
    // Mimic Axios response structure
    return {
      status: res.statusCode,
      headers: res.headers,
      data: res.body
    };
  } catch (err: any) {
    if (err.response) {
      // Mimic Axios error structure
      err.status = err.response.statusCode;
      err.headers = err.response.headers;
      err.data = err.response.body;
    }
    throw err;
  }
}

export async function post(url: string, data?: any, options?: GotConfigShadow) {
  const opt = ObjectReplaceFrom(gotDefault(url), options);
  opt.method = 'POST';
  if (data !== undefined) {
    // Handle FormData (multipart)
    if (typeof data === 'object' && data !== null && typeof data.getHeaders === 'function') {
      opt.body = data;
      // Merge form-data headers
      opt.headers = { ...(opt.headers || {}), ...data.getHeaders() };
    } else if (typeof data === 'object' && !Buffer.isBuffer(data)) {
      opt.json = data;
      if (opt.headers && opt.headers['Content-Type']) delete opt.headers['Content-Type'];
    } else {
      opt.body = data;
    }
  }
  // Proxy/agent support
  if (opt.proxy) {
    const proxyUrl = opt.proxy;
    if (typeof opt.url === 'string' && opt.url.startsWith('https://')) {
      opt.agent = { https: new HttpsProxyAgent(proxyUrl) };
    } else {
      opt.agent = { http: new HttpProxyAgent(proxyUrl) };
    }
    delete opt.proxy;
  }
  try {
    const res = await got(opt);
    return {
      status: res.statusCode,
      headers: res.headers,
      data: res.body
    };
  } catch (err: any) {
    if (err.response) {
      err.status = err.response.statusCode;
      err.headers = err.response.headers;
      err.data = err.response.body;
    }
    throw err;
  }
}

export function testProxy(proxy: string, target = 'http://google.com', options?: GotConfigShadow) {
  const def = {
    proxy: 'http://' + proxy.replace(/https?:\/\//, '')
  };
  return get(target, Object.assign(def, options));
}

/**
 * Object replace value by key from another object
 * @param obj Object to replace
 * @param anotherobj Replace key from this object
 * @returns
 */
function ObjectReplaceFrom<T>(obj: T, anotherobj: Record<string, any>): T {
  if (typeof anotherobj == 'object') {
    for (const key in anotherobj) {
      if (Object.prototype.hasOwnProperty.call(anotherobj, key)) {
        const element = anotherobj[key];
        (obj as any)[key] = element;
      }
    }
  }
  return obj;
}

export default {
  testProxy: testProxy,
  curlGET: get,
  ObjectReplaceFrom: ObjectReplaceFrom,
  curlPost: post
};
