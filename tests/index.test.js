const proxyGrabber = require('../dist').default;
const grabber = new proxyGrabber();
grabber.get().then(function (proxies) {
  console.log(proxies);
});
