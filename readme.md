# NodeJS Public Proxy Grabber

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
const proxyGrabber = require('../dist').default;
const grabber = new proxyGrabber();
grabber.get().then(function (proxies) {
  console.log(proxies);
});
```

Read More: [Gulp1](./gulpfile.normal.js) | [Gulp2](./gulpfile.ts)
