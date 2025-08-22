import axios, { AxiosResponse } from 'axios';
import fs from 'fs-extra';
import path from 'upath';
import zlib from 'zlib';
import { extractProxies } from './proxyParser.js';
import urls from './sources.json' with { type: 'json' };

/**
 * Fetches proxies from local files and remote URLs, deduplicates them, and writes them in chunks to disk.
 *
 * - Reads proxies from local files in the assets/proxies directory.
 * - Fetches proxies from remote sources defined in sources.json.
 * - Decompresses HTTP responses if needed.
 * - Deduplicates and splits proxies into chunk files.
 *
 * @returns The list of all unique proxies found.
 */

export async function proxyFetcher() {
  let results: string[] = [];
  const filePrefix = 'added-fetch-ts-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const directory = path.join(process.cwd(), 'assets/proxies/');
  fs.ensureDirSync(directory);

  // Collect proxies from local files
  const files = fs.readdirSync(directory);
  for (const filename of files) {
    const filepath = path.join(directory, filename);
    if (fs.statSync(filepath).isFile() && filename.startsWith(filePrefix)) {
      const classList = extractProxies(filepath);
      if (classList) {
        const proxies = Array.from(new Set(classList.map((obj) => obj.proxy)));
        results.push(...proxies);
      }
    }
  }

  // Fetch proxies from URLs
  for (const url of urls) {
    try {
      const response: AxiosResponse = await axios.get(url, {
        responseType: 'arraybuffer',
        decompress: true
      });
      if (response && response.status === 200) {
        const text = decompressRequestsResponse(response);
        const classList = extractProxies(text);
        const proxyList = Array.from(new Set(classList.map((obj) => obj.proxy)));
        results.push(...proxyList);
      }
    } catch (e: any) {
      console.error(`fail fetch proxy from ${url}: ${e.message}`);
      if (e.message.includes('module')) {
        console.error(e.stack);
        process.exit(1);
      }
    }
  }

  // Deduplicate
  results = Array.from(new Set(results));
  console.log(`got ${results.length} proxies`);

  // Split into chunks
  function splitList<T>(lst: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < lst.length; i += chunkSize) {
      chunks.push(lst.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const chunkSize = 10000;
  const chunks = splitList(results, chunkSize);

  console.log(`Total chunks: ${chunks.length}`);
  chunks.forEach((chunk, i) => {
    console.log(`Chunk ${i} size: ${chunk.length}`);
    const nf = path.join(directory, `${filePrefix}-chunk-${i}.txt`);
    fs.writeFileSync(nf, chunk.join('\n') + '\n\n');
  });

  return results;
}

/**
 * Decompresses an Axios HTTP response if it is compressed (gzip, deflate, br), otherwise returns the decoded string.
 *
 * @param response The Axios HTTP response object.
 * @returns The decompressed response body as a string.
 */
function decompressRequestsResponse(response: AxiosResponse) {
  const encoding = response.headers['content-encoding'];
  const buffer = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);

  if (encoding === 'gzip') {
    return zlib.gunzipSync(new Uint8Array(buffer)).toString('utf-8');
  } else if (encoding === 'deflate') {
    return zlib.inflateSync(new Uint8Array(buffer)).toString('utf-8');
  } else if (encoding === 'br') {
    // Convert Buffer to Uint8Array for brotliDecompressSync compatibility
    return zlib.brotliDecompressSync(new Uint8Array(buffer)).toString('utf-8');
  }
  // No encoding or unknown encoding
  return buffer.toString('utf-8');
}

// Run if main
if (process.argv.some((arg) => path.toUnix(arg).includes('parser/fetcher'))) {
  proxyFetcher();
}
