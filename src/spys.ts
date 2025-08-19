import Bluebird from 'bluebird';
import { parser } from './parser/spys.txt.js';
export { returnObj as returnObj, parser as parse } from './parser/spys.txt.js';
import { get as curlGET } from './curl.js';

/**
 * Grab Spys
 * @returns
 */
export default function spys() {
  return Bluebird.resolve(curlGET('https://spys.me/proxy.txt')).then((res) => {
    return parser(String(res.data));
  });
}
