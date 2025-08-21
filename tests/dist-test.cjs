const { proxyGrabber } = require('../');

const grabber = new proxyGrabber();
grabber.get().then((response) => {
  console.log(`Proxies grabbed: ${response.length}`);
});
