import Promise from 'bluebird';
export { returnObj as returnObj, parser as parse } from './parser/spys.txt';
/**
 * Grab Spys
 * @returns
 */
export default function spys(): Promise<import("./parser/spys.txt").returnObj[]>;
