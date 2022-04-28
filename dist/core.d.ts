import { returnObj } from './spys';
import Promise from 'bluebird';
import 'js-prototypes';
/**
 * Proxy Grabber
 */
export default class proxyGrabber {
    /**
     * Time to live
     */
    TTL: number;
    /**
     * Proxy Grabber Constructor
     * @param TTL Time To Live in Day
     */
    constructor(TTL?: number);
    method1(force?: boolean): Promise<returnObj[]>;
    method2(force?: boolean): Promise<returnObj[]>;
    /**
     * https://proxy-list.org grabber
     * @param force force update
     * @returns
     */
    method3(force?: boolean): Promise<returnObj[]>;
    /**
     * Get all grabbed proxies
     * @returns
     */
    get(): Promise<returnObj[]>;
    getDb(): {
        proxyListOrg: (force?: boolean) => Promise<returnObj[]>;
        sslProxiesOrg: (force?: boolean) => Promise<returnObj[]>;
        spys: (force?: boolean) => Promise<returnObj[]>;
    };
    /**
     * Test all proxies
     * @param limit limit proxies each instance to test (0=unlimited)
     */
    test(limit?: number): Promise<TestResult[][]>;
    toString(): string;
}
interface TestResult {
    error: boolean;
    proxy: returnObj;
    message?: string;
    code?: number;
}
export {};
