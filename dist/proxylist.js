"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var bluebird_1 = __importDefault(require("bluebird"));
var jsdom_1 = require("jsdom");
var curl_1 = require("./curl");
function proxyListOrg() {
    return bluebird_1.default.resolve((0, curl_1.get)('https://proxy-list.org/english/search.php?search=ssl-no&country=any&type=any&port=any&ssl=any&p1')).then(function (res) {
        var data = res.data;
        var buildObject = {
            proxy: null,
            code: null,
            anonymity: null,
            ssl: null,
            google: null,
            alert: null,
            type: 'http',
            test: null,
        };
        var resultWrapper = [];
        var dom = new jsdom_1.JSDOM(data);
        var doc = dom.window.document;
        Array.from(doc.querySelectorAll('ul')).map(function (ul) {
            var li = ul.querySelectorAll('li');
            if (li) {
                var proxy = li[0].textContent;
                var extract = /Proxy\(['"](.*)['"]\)/gm.exec(proxy);
                if (Array.isArray(extract) && extract.length > 1) {
                    var decode = Buffer.from(extract[1], 'base64').toString('ascii');
                    buildObject.proxy = decode;
                    var type = li[1].textContent.trim().toLowerCase();
                    buildObject.ssl = type == 'https';
                    var anonymity = li[3].textContent.trim().toLowerCase();
                    switch (anonymity) {
                        case 'anonymous':
                            buildObject.anonymity = 'A';
                            break;
                        case 'transparent':
                            buildObject.anonymity = 'N';
                            break;
                        case 'elite':
                            buildObject.anonymity = 'H';
                            break;
                        default:
                            buildObject.anonymity = 'N';
                            break;
                    }
                    var location_1 = li[4].querySelector('[class*=flag]');
                    buildObject.code = location_1.classList.toString().replace('flag', '').trim().toUpperCase();
                    resultWrapper.push(buildObject);
                }
            }
        });
        return resultWrapper;
    });
}
module.exports = proxyListOrg;
