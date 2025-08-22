import { proxyGrabber } from '../dist/index.js';

const grabber = new proxyGrabber();
grabber.get().then((response) => {
  console.log(`Proxies grabbed: ${response.length}`);
});
