import whyIsNodeRunning from 'why-is-node-running'; // should be your first import
import * as curl from '../src/curl.js';

curl
  .get('https://example.com')
  .then((response) => {
    console.log('Response:', response.status);
  })
  .catch((err) => {
    console.error('axios failed:', err && err.message ? err.message : err);
    if (err && err.response) {
      console.error('status:', err.response.status);
    }
  })
  .finally(() => {
    // logs out active handles that are keeping node running
    whyIsNodeRunning();
  });
