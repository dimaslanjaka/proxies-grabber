"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
var tslib_1 = require("tslib");
var node_libcurl_1 = require("node-libcurl");
require("js-prototypes");
var bluebird_1 = tslib_1.__importDefault(require("bluebird"));
var spys_txt_1 = require("./parser/spys.txt");
var spys_txt_2 = require("./parser/spys.txt");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return spys_txt_2.parser; } });
/**
 * Grab Spys
 * @returns
 */
function spys() {
    return bluebird_1.default.resolve(node_libcurl_1.curly.get('https://spys.me/proxy.txt')).then(function (res) {
        if (res.statusCode == 200) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            var regex = /(\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b):?(\d{2,5})/gm;
            return (0, spys_txt_1.parser)(String(res.data));
        }
    });
}
exports.default = spys;
