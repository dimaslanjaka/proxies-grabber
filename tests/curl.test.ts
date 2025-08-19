import { get, post, testProxy } from '../src/curl';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

describe('curl.ts', () => {
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
    const res = await get('https://httpbin.org/json');
    expect(res).toHaveProperty('status', 200);
    expect(res).toHaveProperty('headers');
    expect(res).toHaveProperty('data');
    expect(typeof res.data).toBe('string');
    expect(() => JSON.parse(res.data)).not.toThrow();
    const json = JSON.parse(res.data);
    expect(json).toHaveProperty('slideshow');
  });

  it('should fetch a TXT file and return status/data/headers (data is string)', async () => {
    const res = await get('https://httpbin.org/robots.txt');
    expect(res).toHaveProperty('status', 200);
    expect(res).toHaveProperty('headers');
    expect(res).toHaveProperty('data');
    expect(typeof res.data).toBe('string');
    expect(res.data).toMatch(/Disallow/);
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
    const res = await post('https://httpbin.org/post', payload);
    expect(res).toHaveProperty('status', 200);
    expect(typeof res.data).toBe('string');
    const json = JSON.parse(res.data);
    expect(json.json).toEqual(payload);
  });

  it('should POST www-form-urlencoded and receive it back', async () => {
    const params = new URLSearchParams({ foo: 'bar', num: '42' });
    const res = await post('https://httpbin.org/post', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    expect(res).toHaveProperty('status', 200);
    expect(typeof res.data).toBe('string');
    const json = JSON.parse(res.data);
    expect(json.form).toEqual({ foo: 'bar', num: '42' });
  });

  it('should POST a file (multipart/form-data) and receive it back', async () => {
    const form = new FormData();
    form.append('file', fs.createReadStream(path.join(__dirname, 'curl.test.ts')));
    const res = await post('https://httpbin.org/post', form, {
      headers: form.getHeaders()
    });
    expect(res).toHaveProperty('status', 200);
    expect(typeof res.data).toBe('string');
    const json = JSON.parse(res.data);
    expect(json.files).toHaveProperty('file');
    expect(json.files.file).toMatch(/import\s+\{\s*get,/); // file content snippet
  });
});
