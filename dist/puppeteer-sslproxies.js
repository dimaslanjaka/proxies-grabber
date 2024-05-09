var tslib_1 = require("tslib");
var puppeteer = require('puppeteer');
var fs = require('fs');
var path = require('path');
var sleep = require('./utils/sleep');
/**
 * @type {import('axios').AxiosStatic}
 */
var axios = require('axios');
function sslproxies_browser() {
    var _this = this;
    return new Promise(function (resolve, reject) {
        puppeteer
            .launch({ args: ['--no-sandbox', '--start-maximized'], headless: false, defaultViewport: null, timeout: 0 })
            .then(function (browser) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var page, scriptContent, current_page, ix, result, cookies, cookieString;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // browser.on('disconnected', browser.close);
                        console.log('Running tests..');
                        return [4 /*yield*/, browser.newPage()];
                    case 1:
                        page = _a.sent();
                        // await page.goto('https://bot.sannysoft.com');
                        return [4 /*yield*/, page.goto('https://www.sslproxies.org/')];
                    case 2:
                        // await page.goto('https://bot.sannysoft.com');
                        _a.sent();
                        return [4 /*yield*/, page
                                .waitForSelector('body table')
                                .then(function () { return console.log('<body/> visible'); })
                                .catch(reject)];
                    case 3:
                        _a.sent();
                        console.log('execute js string');
                        scriptContent = fs.readFileSync(path.join(__dirname, '../packages/php-proxy-hunter/userscripts/sslproxies.js'), 'utf-8');
                        return [4 /*yield*/, page.evaluate(scriptContent)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, page
                                .waitForSelector('button#php-proxy-hunter-grab-proxy')
                                .then(function () { return console.log('parser button visible'); })
                                .catch(reject)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, page
                                .evaluate(function () {
                                document.querySelector('button#php-proxy-hunter-grab-proxy').click();
                            })
                                .catch(reject)];
                    case 6:
                        _a.sent();
                        sleep(5000);
                        return [4 /*yield*/, getActivePage(browser, 30)];
                    case 7:
                        current_page = _a.sent();
                        ix = 0;
                        _a.label = 8;
                    case 8:
                        if (!!current_page) return [3 /*break*/, 10];
                        ix++;
                        return [4 /*yield*/, getActivePage(browser, 30)];
                    case 9:
                        current_page = _a.sent();
                        if (ix > 3)
                            return [3 /*break*/, 10];
                        return [3 /*break*/, 8];
                    case 10:
                        result = null;
                        if (!current_page) return [3 /*break*/, 12];
                        return [4 /*yield*/, current_page.content()];
                    case 11:
                        result = _a.sent();
                        cookies = {
                            __ga: 'value_of__ga_cookie',
                            _ga: 'value_of__ga_cookie',
                        };
                        cookieString = Object.entries(cookies)
                            .map(function (_a) {
                            var _b = tslib_1.__read(_a, 2), key = _b[0], value = _b[1];
                            return "".concat(key, "=").concat(value);
                        })
                            .join('; ');
                        axios
                            .post('http://sh.webmanajemen.com/proxyAdd.php', new URLSearchParams({ proxies: result }), {
                            withCredentials: true,
                            headers: {
                                Cookie: cookieString,
                            },
                        })
                            // .then((res) => {
                            //   console.log(res.data);
                            // })
                            .catch(function () {
                            //
                        });
                        _a.label = 12;
                    case 12: return [4 /*yield*/, browser.close()];
                    case 13:
                        _a.sent();
                        resolve(result);
                        return [2 /*return*/];
                }
            });
        }); })
            .catch(reject);
    });
}
/**
 *
 * @param {puppeteer.Browser} browser
 * @param {number} timeout
 * @returns
 */
function getActivePage(browser, timeout) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var start, pages, arr, pages_1, pages_1_1, p, e_1_1;
        var e_1, _a;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    start = new Date().getTime();
                    _b.label = 1;
                case 1:
                    if (!(new Date().getTime() - start < timeout)) return [3 /*break*/, 11];
                    return [4 /*yield*/, browser.pages()];
                case 2:
                    pages = _b.sent();
                    arr = [];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 8, 9, 10]);
                    pages_1 = (e_1 = void 0, tslib_1.__values(pages)), pages_1_1 = pages_1.next();
                    _b.label = 4;
                case 4:
                    if (!!pages_1_1.done) return [3 /*break*/, 7];
                    p = pages_1_1.value;
                    return [4 /*yield*/, p.evaluate(function () {
                            return document.visibilityState.trim() == 'visible';
                        })];
                case 5:
                    if (_b.sent()) {
                        arr.push(p);
                    }
                    _b.label = 6;
                case 6:
                    pages_1_1 = pages_1.next();
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (pages_1_1 && !pages_1_1.done && (_a = pages_1.return)) _a.call(pages_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 10:
                    if (arr.length == 1)
                        return [2 /*return*/, arr[0]];
                    return [3 /*break*/, 1];
                case 11: return [2 /*return*/];
            }
        });
    });
}
module.exports = sslproxies_browser;
