import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { extractProxies } from '../src/parser/proxyParser.js';
import { testProxy } from '../src/curl.js';
import ansiColors from 'ansi-colors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const proxyTxt = path.join(__dirname, 'proxies.txt');
if (!fs.existsSync(proxyTxt)) {
  fs.writeFileSync(proxyTxt, '');
}
// Throw when proxy txt is empty
if (fs.readFileSync(proxyTxt, 'utf-8').trim() === '') {
  throw new Error('Proxy file is empty, please add proxies to ' + proxyTxt);
}

const objProxies = extractProxies(fs.readFileSync(proxyTxt, 'utf-8'));

if (objProxies.length === 0) {
  throw new Error('No valid proxies found in ' + proxyTxt);
}

// Test all proxies sequentially and log results for http, https, socks4, socks5
async function runAllProxyTests() {
  for (const proxy of objProxies) {
    try {
      // Try as http, https, socks4, socks5 for each IP:PORT
      const base = proxy.proxy.replace(/^(https?|socks[45]):\/\//, '');
      const types = [`http://${base}`, `https://${base}`, `socks4://${base}`, `socks5://${base}`];
      for (const typeProxy of types) {
        try {
          const result = await testProxy(typeProxy);
          console.log(`Success: ${typeProxy}`, result.status);
        } catch (err) {
          const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : err;
          console.error(ansiColors.red('ERROR'), `testing proxy ${typeProxy}: ${msg}`);
        }
      }
    } catch (err) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : err;
      console.error(ansiColors.red('ERROR'), `testing proxy ${proxy.proxy}: ${msg}`);
    }
  }
}

runAllProxyTests();
