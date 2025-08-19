import 'dotenv/config';
import proxyGrabber from '../src/index.js';

const grabber = new proxyGrabber();
grabber
  .method1()
  .then(function (proxies) {
    console.log(proxies.map((o) => o.proxy).join('\n'));
  })
  .catch((err) => {
    console.error('Proxy grabber failed:', err && err.message ? err.message : err);
    if (err && err.response) {
      console.error('Status:', err.response.status);
      // console.error('Response data:', err.response.data);
    }
  });

// run this file with:
// node --loader ts-node/esm "tests/minimal-run.ts" > tmp/output.txt 2>&1
