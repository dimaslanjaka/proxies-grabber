import 'dotenv/config';
import { spysOneBrowser } from '../src/spys';
// import proxyGrabber from '../src/index.js';

// const grabber = new proxyGrabber();
// grabber
//   .method1(true)
//   .then(function (proxies) {
//     console.log(proxies.map((o) => o.proxy).join('\n'));
//   })
//   .catch((err) => {
//     if (err && err.response) {
//       console.error('Status:', err.response.status);
//       // console.error('Response data:', err.response.data);
//     } else {
//       console.error('Error:', err);
//     }
//   });

// run this file with:
// node --loader ts-node/esm "tests/minimal-run.ts" > tmp/output.txt 2>&1

spysOneBrowser()
  .then((proxies) => {
    console.log(proxies.join('\n'));
  })
  .catch(console.error);
