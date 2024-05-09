import Bluebird from 'bluebird';
import { parser } from './parser/spys.txt';
export { returnObj as returnObj, parser as parse } from './parser/spys.txt';
import { get as curlGET } from './curl';

/**
 * Grab Spys
 * @returns
 */
export default function spys() {
  return Bluebird.resolve(curlGET('https://spys.me/proxy.txt')).then((res) => {
    return parser(String(res.data));
  });
}
