# NodeJS Public Proxy Grabber

![types](https://badgen.net/npm/types/proxies-grabber?style=flat-square)
![version](https://badgen.net/npm/v/proxies-grabber?style=flat-square)

typescript
```ts
import proxyGrabber from 'proxies-grabber';
const grabber = new proxyGrabber();
grabber.get().then(function(proxies){
  console.log(proxies);
})
```

javascript
```js
const proxyGrabber = require('proxies-grabber').default;
// or
// const { proxyGrabber } = require('proxies-grabber');
const grabber = new proxyGrabber();
grabber.get().then(function (proxies) {
  console.log(proxies);
});
```

Read More: [Gulpfile](./gulpfile.ts)

See also: [PHP Proxy Hunter](https://github.com/dimaslanjaka/php-proxy-hunter)

Github: https://github.com/dimaslanjaka/proxies-grabber

NPM: https://www.npmjs.com/package/proxies-grabber
