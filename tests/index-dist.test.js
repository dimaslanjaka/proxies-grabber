const proxyGrabber = require('../dist').default;

describe('proxyGrabber', () => {
  let grabber;

  afterAll(async () => {
    // If your grabber has a close or cleanup method, call it here
    if (grabber && typeof grabber.close === 'function') {
      await grabber.close();
    }
    // Force Jest to wait for all timers and async operations
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it('should fetch proxies', async () => {
    grabber = new proxyGrabber();
    const proxies = await grabber.get();
    expect(Array.isArray(proxies)).toBe(true);
    expect(proxies.length).toBeGreaterThan(0);
  });
});
