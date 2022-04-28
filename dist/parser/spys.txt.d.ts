import 'js-prototypes';
export declare type returnObj = {
    proxy: string;
    code: string;
    anonymity: string | 'A' | 'N' | 'H';
    ssl: boolean;
    google: boolean;
    alert: boolean;
    type: string | 'http' | 'socks4' | 'socks5';
    test: string | 'PASSED' | 'FAILED';
};
declare function parse(data: string): returnObj[];
export default parse;
export declare const parser: typeof parse;
