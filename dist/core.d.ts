import { returnObj } from './spys';
import Bluebird from 'bluebird';
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
    method1(force?: boolean): Bluebird<returnObj[]>;
    method2(force?: boolean): Bluebird<returnObj[]>;
    /**
     * https://proxy-list.org grabber
     * @param force force update
     * @returns
     */
    method3(force?: boolean): Bluebird<returnObj[]>;
    /**
     * Get all grabbed proxies
     * @param proxy filter only 1 proxy
     * @returns
     */
    get(proxy?: string): Promise<returnObj[]>;
    getDb(): {
        proxyListOrg: (force?: boolean) => Bluebird<returnObj[]>;
        sslProxiesOrg: (force?: boolean) => Bluebird<returnObj[]>;
        spys: (force?: boolean) => Bluebird<returnObj[]>;
    };
    /**
     * Test all proxies from {@link method1}
     */
    testMethod1(limit?: number): Promise<void>;
    /**
     * Test proxies from array of {@link returnObj}
     * @param proxies
     * @param dbKey
     * @returns
     */
    testProxies(proxies: Partial<returnObj>[], dbKey?: string): Promise<TestResult>[];
    testSingleProxy(obj: Partial<returnObj>): Promise<TestResult>;
    /**
     * Test all grabbed proxies
     * @param limit limit proxies each instance to test (0=unlimited)
     */
    test(limit?: number): Bluebird<TestResult[][]>;
    toString(): string;
}
interface TestResult {
    anonymity: 'T' | 'H' | 'A';
    error: boolean;
    proxy: Partial<returnObj>;
    ip?: string;
    port?: number | string;
    proxyStr?: string;
    message?: string;
    code?: number;
}
export { proxyGrabber };
