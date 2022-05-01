"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyGrabber = void 0;
var tslib_1 = require("tslib");
var db_1 = tslib_1.__importDefault(require("./db"));
var spys_1 = tslib_1.__importDefault(require("./spys"));
var moment_1 = tslib_1.__importDefault(require("moment"));
var sslproxies_1 = tslib_1.__importDefault(require("./sslproxies"));
var bluebird_1 = tslib_1.__importDefault(require("bluebird"));
var proxylist_1 = tslib_1.__importDefault(require("./proxylist"));
var upath_1 = tslib_1.__importDefault(require("upath"));
var curl_1 = tslib_1.__importDefault(require("./curl"));
var array_1 = require("./utils/array");
var db = new db_1.default(upath_1.default.join(process.cwd(), 'databases/proxies'));
/**
 * Proxy Grabber
 */
var proxyGrabber = /** @class */ (function () {
    /**
     * Proxy Grabber Constructor
     * @param TTL Time To Live in Day
     */
    function proxyGrabber(TTL) {
        if (TTL === void 0) { TTL = 1; }
        this.TTL = TTL;
    }
    proxyGrabber.prototype.method1 = function (force) {
        if (force === void 0) { force = false; }
        return tslib_1.__awaiter(this, void 0, bluebird_1.default, function () {
            var lastUpdated, proxies;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastUpdated = db.exists('/spys/lastUpdated') ? db.get('/spys/lastUpdated') : 100;
                        if (!((0, moment_1.default)().diff(lastUpdated, 'days') > this.TTL || force)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, spys_1.default)()];
                    case 1:
                        proxies = _a.sent();
                        db.push('/spys/lastUpdated', new Date());
                        db.push('/spys/proxies', proxies);
                        return [2 /*return*/, proxies];
                    case 2: return [2 /*return*/, bluebird_1.default.resolve(db.get('/spys/proxies'))];
                }
            });
        });
    };
    proxyGrabber.prototype.method2 = function (force) {
        if (force === void 0) { force = false; }
        return tslib_1.__awaiter(this, void 0, bluebird_1.default, function () {
            var lastUpdated, proxies;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastUpdated = db.exists('/sslProxiesOrg/lastUpdated') ? db.get('/sslProxiesOrg/lastUpdated') : 100;
                        if (!((0, moment_1.default)().diff(lastUpdated, 'days') > this.TTL || force)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, sslproxies_1.default)()];
                    case 1:
                        proxies = _a.sent();
                        db.push('/sslProxiesOrg/lastUpdated', new Date());
                        db.push('/sslProxiesOrg/proxies', proxies);
                        return [2 /*return*/, proxies];
                    case 2: return [2 /*return*/, bluebird_1.default.resolve(db.get('/sslProxiesOrg/proxies'))];
                }
            });
        });
    };
    /**
     * https://proxy-list.org grabber
     * @param force force update
     * @returns
     */
    proxyGrabber.prototype.method3 = function (force) {
        if (force === void 0) { force = false; }
        return tslib_1.__awaiter(this, void 0, bluebird_1.default, function () {
            var lastUpdated, proxies;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastUpdated = db.exists('/proxyListOrg/lastUpdated') ? db.get('/proxyListOrg/lastUpdated') : 100;
                        if (!((0, moment_1.default)().diff(lastUpdated, 'days') > this.TTL || force)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, proxylist_1.default)()];
                    case 1:
                        proxies = _a.sent();
                        db.push('/proxyListOrg/lastUpdated', new Date());
                        db.push('/proxyListOrg/proxies', proxies);
                        return [2 /*return*/, proxies];
                    case 2: return [2 /*return*/, bluebird_1.default.resolve(db.get('/proxyListOrg/proxies'))];
                }
            });
        });
    };
    /**
     * Get all grabbed proxies
     * @param proxy filter only 1 proxy
     * @returns
     */
    proxyGrabber.prototype.get = function (proxy) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var proxies, proxies2, proxies3, merge, exactMatch, includeMatch, same;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.method1()];
                    case 1:
                        proxies = _a.sent();
                        return [4 /*yield*/, this.method2()];
                    case 2:
                        proxies2 = _a.sent();
                        return [4 /*yield*/, this.method3()];
                    case 3:
                        proxies3 = _a.sent();
                        merge = Object.assign(proxies, proxies2, proxies3);
                        if (typeof proxy === 'string') {
                            exactMatch = merge.find(function (o) { return o.proxy === proxy; });
                            includeMatch = merge.find(function (o) { return o.proxy.includes(proxy); });
                            same = JSON.stringify(exactMatch) == JSON.stringify(includeMatch);
                            // @todo return single object if exact and includes is same
                            if (same)
                                return [2 /*return*/, [exactMatch]];
                            // @todo return two matches
                            return [2 /*return*/, [exactMatch, includeMatch]];
                        }
                        return [2 /*return*/, merge];
                }
            });
        });
    };
    proxyGrabber.prototype.getDb = function () {
        return { proxyListOrg: this.method3, sslProxiesOrg: this.method2, spys: this.method1 };
    };
    /**
     * Test all proxies from {@link method1}
     */
    proxyGrabber.prototype.testMethod1 = function (limit) {
        if (limit === void 0) { limit = 10; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var get, i, item, test;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.method1()];
                    case 1:
                        get = _a.sent();
                        if (limit > 0)
                            get = get.slice(0, limit);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < get.length)) return [3 /*break*/, 5];
                        item = get[i];
                        return [4 /*yield*/, this.testSingleProxy(item)];
                    case 3:
                        test = _a.sent();
                        console.log(test);
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test proxies from array of {@link returnObj}
     * @param proxies
     * @param dbKey
     * @returns
     */
    proxyGrabber.prototype.testProxies = function (proxies, dbKey) {
        var _this = this;
        console.log('Testing ' + proxies.length + ' ' + (proxies.length > 1 ? 'proxies' : 'proxy'));
        return proxies.map(function (obj) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.testSingleProxy(obj)];
                    case 1:
                        result = _a.sent();
                        obj.anonymity = result.anonymity;
                        if (typeof dbKey == 'string')
                            db.edit(dbKey, obj, { proxy: obj.proxy });
                        return [2 /*return*/, result];
                }
            });
        }); });
    };
    proxyGrabber.prototype.testSingleProxy = function (obj) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, res, proxyDetections, headers_1, isleaked, splitProxy, ip, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = { error: true, proxy: null, message: null, anonymity: null, code: 0 };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, curl_1.default.testProxy(obj.proxy, 'https://httpbin.org/get', {
                                headers: {
                                    Accept: 'application/json',
                                },
                            })];
                    case 2:
                        res = _a.sent();
                        //console.log(res.headers[1]['content-type'] == 'application/json');
                        result.error = res.status != 200 && res.headers[1]['content-type'] != 'application/json';
                        result.proxy = obj;
                        proxyDetections = [
                            'ACCPROXYWS',
                            'CDN-SRC-IP',
                            'CLIENT-IP',
                            'CLIENT_IP',
                            'CUDA_CLIIP',
                            'FORWARDED',
                            'FORWARDED-FOR',
                            'REMOTE-HOST',
                            'X-CLIENT-IP',
                            'X-COMING-FROM',
                            'X-FORWARDED',
                            'X-FORWARDED-FOR',
                            'X-FORWARDED-FOR-IP',
                            'X-FORWARDED-HOST',
                            'X-FORWARDED-SERVER',
                            'X-HOST',
                            'X-NETWORK-INFO',
                            'X-NOKIA-REMOTESOCKET',
                            'X-PROXYUSER-IP',
                            'X-QIHOO-IP',
                            'X-REAL-IP',
                            'XCNOOL_FORWARDED_FOR',
                            'XCNOOL_REMOTE_ADDR',
                            'MT-PROXY-ID',
                            'PROXY-AGENT',
                            'PROXY-CONNECTION',
                            'SURROGATE-CAPABILITY',
                            'VIA',
                            'X-ACCEPT-ENCODING',
                            'X-ARR-LOG-ID',
                            'X-AUTHENTICATED-USER',
                            'X-BLUECOAT-VIA',
                            'X-CACHE',
                            'X-CID-HASH',
                            'X-CONTENT-OPT',
                            'X-D-FORWARDER',
                            'X-FIKKER',
                            'X-FORWARDED-PORT',
                            'X-FORWARDED-PROTO',
                            'X-IMFORWARDS',
                            'X-LOOP-CONTROL',
                            'X-MATO-PARAM',
                            'X-NAI-ID',
                            'X-NOKIA-GATEWAY-ID',
                            'X-NOKIA-LOCALSOCKET',
                            'X-ORIGINAL-URL',
                            'X-PROXY-ID',
                            'X-ROAMING',
                            'X-TEAMSITE-PREREMAP',
                            'X-TINYPROXY',
                            'X-TURBOPAGE',
                            'X-VARNISH',
                            'X-VIA',
                            'X-WAP-PROFILE',
                            'X-WRPROXY-ID',
                            'X-XFF-0',
                            'XROXY-CONNECTION',
                            'X-REAL-IP',
                            'X-FORWARDED-FOR',
                            'X-PROXY-ID',
                            'VIA',
                            'X-FORWARDED-FOR',
                            'FORWARDED-FOR',
                            'X-FORWARDED',
                            'FORWARDED',
                            'CLIENT-IP',
                            'FORWARDED-FOR-IP',
                            'VIA',
                            'X-FORWARDED-FOR',
                            'FORWARDED-FOR',
                            'X-FORWARDED FORWARDED',
                            'CLIENT-IP',
                            'FORWARDED-FOR-IP',
                            'PROXY-CONNECTION',
                            'XROXY-CONNECTION',
                        ];
                        headers_1 = res.data.headers;
                        Object.keys(headers_1).map(function (key) {
                            headers_1[key.toUpperCase()] = headers_1[key];
                            delete headers_1[key];
                        });
                        isleaked = proxyDetections.some(function (h) { return typeof headers_1[h] !== 'undefined'; });
                        splitProxy = obj.proxy.split(':').map(function (s) { return s.trim(); });
                        ip = splitProxy[0];
                        //const port = splitProxy[1];
                        //console.log({ proxy: ip, origin: res.data.origin });
                        if (res.data.origin != ip) {
                            result.anonymity = 'T';
                        }
                        else if (isleaked) {
                            result.anonymity = 'A';
                        }
                        else {
                            result.anonymity = 'H';
                        }
                        obj.anonymity = result.anonymity;
                        console.log(obj.proxy, 'anonymity is', result.anonymity === 'T' ? 'Transparent' : result.anonymity === 'A' ? 'Anonymous' : 'High Anonymous');
                        obj.test = !result.error ? 'PASSED' : 'FAILED';
                        return [2 /*return*/, result];
                    case 3:
                        e_1 = _a.sent();
                        result.error = true;
                        result.proxy = obj;
                        result.message = e_1.message;
                        result.code = parseInt(e_1['code']);
                        return [2 /*return*/, result];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test all grabbed proxies
     * @param limit limit proxies each instance to test (0=unlimited)
     */
    proxyGrabber.prototype.test = function (limit) {
        if (limit === void 0) { limit = 10; }
        var self = this;
        function getProxies() {
            var _this = this;
            var getProxies = [self.method1(), self.method2(), self.method3()];
            var results = [];
            return bluebird_1.default.all(getProxies).map(function (proxies, index) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var dbKey, proxiesToTest, test;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            switch (index) {
                                case 0: // this.method1 database key
                                    dbKey = '/spys/proxies';
                                    break;
                                case 1: // this.method2 database key
                                    dbKey = '/sslProxiesOrg/proxies';
                                    break;
                                case 2: // this.method3 database key
                                    dbKey = '/proxyListOrg/proxies';
                                    break;
                            }
                            if (!dbKey) return [3 /*break*/, 2];
                            proxiesToTest = (0, array_1.shuffle)((0, array_1.uniqueArrayByObjectKey)(proxies, 'proxy'));
                            if (limit > 0)
                                proxiesToTest = proxiesToTest.slice(0, limit);
                            test = self.testProxies(proxiesToTest, dbKey).map(function (tested) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var result;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, tested];
                                        case 1:
                                            result = _a.sent();
                                            results = results.concat(result);
                                            return [4 /*yield*/, bluebird_1.default.all(results)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); });
                            return [4 /*yield*/, bluebird_1.default.all(test)];
                        case 1:
                            _a.sent();
                            console.log('test', index + 1, 'done');
                            return [2 /*return*/, results];
                        case 2:
                            console.log('dbKey not found');
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        }
        return getProxies();
    };
    proxyGrabber.prototype.toString = function () {
        return JSON.stringify(this.get());
    };
    return proxyGrabber;
}());
exports.proxyGrabber = proxyGrabber;
exports.default = proxyGrabber;
exports = proxyGrabber;
