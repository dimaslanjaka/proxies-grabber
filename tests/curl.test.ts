import { get, testProxy } from '../src/curl';

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
});
