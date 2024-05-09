const { proxyGrabber } = require('../dist');

const grabber = new proxyGrabber();
grabber.get().then(function (proxies) {
  console.log(proxies);
});
