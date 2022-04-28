import proxyGrabber from '../src';
const grabber = new proxyGrabber();
grabber.get().then(function (proxies) {
  console.log(proxies);
});
