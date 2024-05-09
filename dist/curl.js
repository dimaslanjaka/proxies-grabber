"use strict";
/* eslint-disable @typescript-eslint/no-empty-function */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testProxy = exports.get = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
var https_proxy_agent_1 = tslib_1.__importDefault(require("https-proxy-agent"));
var axiosDefault = function (url) {
    return {
        baseURL: url,
        maxRedirects: 5,
        timeout: 60 * 1000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
            Referer: 'http://google.com/crawler',
        },
    };
};
function get(url, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var opt, instance, res, statusCode;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opt = ObjectReplaceFrom(axiosDefault(url), options);
                    instance = axios_1.default.create(opt);
                    return [4 /*yield*/, instance.get(url)];
                case 1:
                    res = _a.sent();
                    statusCode = res.status;
                    if (statusCode == 301 || statusCode == 302) {
                        console.log(res.headers);
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.get = get;
function testProxy(proxy, target, options) {
    if (target === void 0) { target = 'http://google.com'; }
    var def = {
        proxy: false,
        httpsAgent: (0, https_proxy_agent_1.default)('http://' + proxy.replace(/https?:\/\//, '')),
    };
    return get(target, Object.assign(def, options));
}
exports.testProxy = testProxy;
/**
 * Object replace value by key from another object
 * @param obj Object to replace
 * @param anotherobj Replace key from this object
 * @returns
 */
function ObjectReplaceFrom(obj, anotherobj) {
    if (typeof anotherobj == 'object') {
        for (var key in anotherobj) {
            if (Object.prototype.hasOwnProperty.call(anotherobj, key)) {
                var element = anotherobj[key];
                obj[key] = element;
            }
        }
    }
    return obj;
}
exports.default = {
    testProxy: testProxy,
    curlGET: get,
    ObjectReplaceFrom: ObjectReplaceFrom,
};
