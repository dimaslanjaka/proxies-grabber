import 'js-prototypes';
import { AxiosRequestConfig } from 'axios';
declare type ObjectAlias = object;
declare type AxiosConfigShadow = AxiosRequestConfig & ObjectAlias & {
    [key: string]: any;
};
export declare function get(url: string, options?: AxiosConfigShadow): Promise<import("axios").AxiosResponse<any, any>>;
export declare function testProxy(proxy: string, target?: string, options?: AxiosConfigShadow): Promise<import("axios").AxiosResponse<any, any>>;
declare function ObjectReplaceFrom<T>(obj: T, anotherobj: Record<string, any>): T;
declare const _default: {
    testProxy: typeof testProxy;
    curlGET: typeof get;
    ObjectReplaceFrom: typeof ObjectReplaceFrom;
};
export default _default;
