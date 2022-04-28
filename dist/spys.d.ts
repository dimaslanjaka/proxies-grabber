import 'js-prototypes';
import Promise from 'bluebird';
export { returnObj as returnObj, parser as parse } from './parser/spys.txt';
declare function spys(): Promise<import("./parser/spys.txt").returnObj[]>;
export default spys;
