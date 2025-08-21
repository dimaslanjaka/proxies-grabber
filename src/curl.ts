import { OptionsOfTextResponseBody } from 'got';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

type GotConfigShadow = OptionsOfTextResponseBody & {
  proxy?: string | undefined;
  [key: string]: any;
};

/**
 * Dynamic got import for ESM/CJS compatibility
 * @param url The request URL.
 * @param options Optional request options.
 */
async function got(url: string | URL, options?: OptionsOfTextResponseBody) {
  const mod = await import('got');
  const lib = mod.default || mod;
  return lib(url, options);
}

/**
 * Returns a default got config for the given URL.
 */
function gotDefault(url: string) {
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

/**
 * Makes an HTTP GET request with proxy and agent support.
 *
 * @param url The request URL.
 * @param options Optional request options and proxy settings.
 * @returns An object with status, headers, and data as string.
 */
export async function get(url: string, options?: GotConfigShadow) {
  const opt = ObjectReplaceFrom(gotDefault(url), options || {}) as any;
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

/**
 * Makes an HTTP POST request with proxy and agent support.
 * Supports JSON, raw, and multipart (FormData) bodies.
 *
 * @param url The request URL.
 * @param data The POST body (JSON, form, or FormData).
 * @param options Optional request options and proxy settings.
 * @returns An object with status, headers, and data as string.
 */
export async function post(url: string, data?: any, options?: GotConfigShadow) {
  const opt = ObjectReplaceFrom(gotDefault(url), options || {}) as any;
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

/**
 * Returns a got agent for the given proxy and target URL.
 *
 * @param proxyUrl The proxy URL (http, https, socks4, socks5).
 * @param targetUrl The target URL for the request.
 * @returns An agent object for got.
 */
function getAgent(proxyUrl: string, targetUrl: string) {
  if (/^socks[45]?:\/\//i.test(proxyUrl)) {
    return targetUrl.startsWith('https://')
      ? { https: new SocksProxyAgent(proxyUrl) }
      : { http: new SocksProxyAgent(proxyUrl) };
  } else if (targetUrl.startsWith('https://')) {
    return { https: new HttpsProxyAgent(proxyUrl) };
  } else {
    return { http: new HttpProxyAgent(proxyUrl) };
  }
}

/**
 * Tests a proxy by making a request to a target URL.
 * Supports HTTP, HTTPS, SOCKS4, and SOCKS5 proxies.
 *
 * @param proxy The proxy URL or host:port string.
 * @param target The target URL to test against.
 * @param options Optional request options.
 * @returns The result of the GET request through the proxy.
 */
export function testProxy(proxy: string, target = 'http://google.com', options?: GotConfigShadow) {
  let proxyUrl = proxy;
  if (!/^https?:\/\//i.test(proxyUrl) && !/^socks[45]?:\/\//i.test(proxyUrl)) {
    proxyUrl = 'http://' + proxyUrl.replace(/^(https?|socks[45]?):\/\//, '');
  }
  const def: { proxy?: string } = {
    proxy: proxyUrl
  };
  const opt = Object.assign(def, options);
  if (opt.proxy) {
    opt.agent = getAgent(opt.proxy, target);
    delete opt.proxy;
  }
  return get(target, opt);
}

/**
 * Replaces values in an object with those from another object by key.
 *
 * @param obj The base object to update.
 * @param anotherobj The object with replacement values.
 * @returns The updated object.
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
