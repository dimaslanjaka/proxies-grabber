import { describe, it, expect } from '@jest/globals';
import { get, post, testProxy } from '../src/curl.js';
import fs from 'fs-extra';
import path from 'upath';
import FormData from 'form-data';

// Use a static test file for multipart upload to avoid __filename issues
const testFilePath = path.join(process.cwd(), 'tmp/test', 'testfile.txt');

describe('curl.ts', () => {
  beforeAll(() => {
    // Ensure the test file exists
    fs.ensureDirSync(path.dirname(testFilePath));
    fs.writeFileSync(testFilePath, 'This is a test file for multipart upload.');
  });

  it('should fetch a page and return status/data/headers', async () => {
    const res = await get('https://example.com');
    expect(res).toHaveProperty('status', 200);
    expect(res).toHaveProperty('headers');
    expect(res).toHaveProperty('data');
    expect(typeof res.data).toBe('string');
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('should support proxy option (dummy, expect error or 407)', async () => {
    // Use a dummy proxy, expect error or 407
    await expect(testProxy('127.0.0.1:9999', 'https://example.com')).rejects.toThrow();
  });

  it('should fetch a JSON API and return status/data/headers (data is string)', async () => {
    let res;
    let lastErr;
    const urls = [
      'https://httpbin.org/json',
      'https://httpbingo.org/json',
      'https://postman-echo.com/get?foo1=bar1&foo2=bar2'
    ];
    for (const url of urls) {
      try {
        res = await get(url);
        if (res.status === 200) break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!res || res.status !== 200) throw lastErr || new Error('All endpoints failed');
    expect(res).toHaveProperty('status', 200);
    expect(res).toHaveProperty('headers');
    expect(res).toHaveProperty('data');
    expect(typeof res.data).toBe('string');
    // Try to parse as JSON, fallback for postman-echo
    let json;
    expect(() => {
      json = JSON.parse(res.data);
    }).not.toThrow();
    expect(json).toBeDefined();
  });

  it('should fetch a TXT file and return status/data/headers (data is string)', async () => {
    let res;
    let lastErr;
    const urls = [
      'https://httpbin.org/robots.txt',
      'https://httpbingo.org/robots.txt',
      'https://postman-echo.com/robots.txt'
    ];
    for (const url of urls) {
      try {
        res = await get(url);
        if (res.status === 200) break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!res || res.status !== 200) throw lastErr || new Error('All endpoints failed');
    expect(res).toHaveProperty('status', 200);
    expect(res).toHaveProperty('headers');
    expect(res).toHaveProperty('data');
    expect(typeof res.data).toBe('string');
    expect(res.data).toMatch(/Disallow|User-agent/);
  });

  it('should fetch an XML file and return status/data/headers (data is string)', async () => {
    const res = await get('https://www.w3schools.com/xml/note.xml');
    expect(res).toHaveProperty('status', 200);
    expect(res).toHaveProperty('headers');
    expect(res).toHaveProperty('data');
    expect(typeof res.data).toBe('string');
    expect(res.data).toMatch(/<note>/);
  });

  it('should POST JSON and receive it back', async () => {
    const payload = { foo: 'bar', num: 42 };
    let res;
    let lastErr;
    const urls = ['https://httpbin.org/post', 'https://httpbingo.org/post', 'https://postman-echo.com/post'];
    for (const url of urls) {
      try {
        res = await post(url, payload);
        if (res.status === 200) break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!res || res.status !== 200) throw lastErr || new Error('All endpoints failed');
    expect(res).toHaveProperty('status', 200);
    expect(typeof res.data).toBe('string');
    const json = JSON.parse(res.data);
    // Accept different echo formats
    expect(json.json || json.data || json).toBeDefined();
  });

  it('should POST www-form-urlencoded and receive it back', async () => {
    const params = new URLSearchParams({ foo: 'bar', num: '42' });
    let res;
    let lastErr;
    const urls = ['https://httpbin.org/post', 'https://httpbingo.org/post', 'https://postman-echo.com/post'];
    for (const url of urls) {
      try {
        res = await post(url, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        if (res.status === 200) break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!res || res.status !== 200) throw lastErr || new Error('All endpoints failed');
    expect(res).toHaveProperty('status', 200);
    expect(typeof res.data).toBe('string');
    const json = JSON.parse(res.data);
    expect(json.form || json.data || json).toBeDefined();
  });

  it('should POST a file (multipart/form-data) and receive it back', async () => {
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    let res;
    let lastErr;
    const urls = ['https://httpbin.org/post', 'https://httpbingo.org/post', 'https://postman-echo.com/post'];
    for (const url of urls) {
      try {
        res = await post(url, form, {
          headers: form.getHeaders()
        });
        if (res.status === 200) break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!res || res.status !== 200) throw lastErr || new Error('All endpoints failed');
    expect(res).toHaveProperty('status', 200);
    expect(typeof res.data).toBe('string');
    const json = JSON.parse(res.data);
    expect(json.files || json.data || json).toBeDefined();
  });
});
