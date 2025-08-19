import { proxyGrabber } from '../src/index';

describe('proxyGrabber', () => {
  it('should fetch proxies', async () => {
    const grabber = new proxyGrabber();
    const proxies = await grabber.get();
    expect(proxies).toBeDefined();
    expect(Array.isArray(proxies)).toBe(true);
    expect(proxies.length).toBeGreaterThan(0); // Ensure we get some proxies
  }, 60000); // 60s timeout for slow network/async

  // No force exit. If you still see open handle errors, check for unclosed resources in your implementation.
});
