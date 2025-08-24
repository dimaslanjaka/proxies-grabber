import { proxyGrabber } from '../dist/index.js';

const grabber = new proxyGrabber();
(async () => {
  try {
    const response = await grabber.get();
    console.log(`Proxies grabbed: ${response.length}`);
    if (response.length > 0) {
      try {
        const res = await grabber.test(1);
        console.log(`Proxies working: ${res.length}`);
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
})();
