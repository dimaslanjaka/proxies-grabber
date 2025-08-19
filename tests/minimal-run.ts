import whyIsNodeRunning from 'why-is-node-running'; // should be your first import

// Minimal run script to test the proxyGrabber functionality
import 'dotenv/config'; // Load environment variables from .env file

import proxyGrabber from '../src/index.js';

const grabber = new proxyGrabber();
grabber
  .get()
  .then(function (proxies) {
    console.log(proxies.map((o) => o.proxy).join('\n'));
  })
  .catch((err) => {
    console.error('Proxy grabber failed:', err && err.message ? err.message : err);
    if (err && err.response) {
      console.error('Status:', err.response.status);
      // console.error('Response data:', err.response.data);
    }
  })
  .finally(() => {
    whyIsNodeRunning();
  });

// run this file with:
// node --loader ts-node/esm "tests/minimal-run.ts" > tmp/output.txt 2>&1
