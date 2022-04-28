import { returnObj } from './spys';
import Promise from 'bluebird';
import 'js-prototypes';
declare class proxyGrabber {
  TTL: number;
  constructor(TTL?: number);
  method1(force?: boolean): Promise<returnObj[]>;
  method2(force?: boolean): Promise<returnObj[]>;
  method3(force?: boolean): Promise<returnObj[]>;
  get(): Promise<returnObj[]>;
  getDb(): {
    proxyListOrg: (force?: boolean) => Promise<returnObj[]>;
    sslProxiesOrg: (force?: boolean) => Promise<returnObj[]>;
    spys: (force?: boolean) => Promise<returnObj[]>;
  };
  test(limit?: number): Promise<TestResult[][]>;
  toString(): string;
}
interface TestResult {
  error: boolean;
  proxy: returnObj;
  message?: string;
  code?: number;
}
export default proxyGrabber;
