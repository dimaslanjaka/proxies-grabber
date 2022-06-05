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
const grabber = new proxyGrabber();
grabber.get().then(function (proxies) {
  console.log(proxies);
});
```

Read More: [Gulpfile](./gulpfile.ts)

Github: https://github.com/dimaslanjaka/proxies-grabber
