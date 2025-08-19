import { spysOneBrowser } from '../src/spys';

describe('spysOneBrowser', () => {
  it('should fetch a non-empty array of proxies in IP:PORT format', async () => {
    const proxies = await spysOneBrowser();
    expect(Array.isArray(proxies)).toBe(true);
    expect(proxies.length).toBeGreaterThan(0);
    for (const proxy of proxies) {
      expect(proxy).toMatch(/^\d+\.\d+\.\d+\.\d+:\d+$/);
    }
  }, 120000); // Allow up to 2 minutes for Puppeteer scrape
});
