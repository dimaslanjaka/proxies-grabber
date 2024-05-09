"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
var tslib_1 = require("tslib");
var bluebird_1 = tslib_1.__importDefault(require("bluebird"));
var spys_txt_1 = require("./parser/spys.txt");
var spys_txt_2 = require("./parser/spys.txt");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return spys_txt_2.parser; } });
var curl_1 = require("./curl");
/**
 * Grab Spys
 * @returns
 */
function spys() {
    return bluebird_1.default.resolve((0, curl_1.get)('https://spys.me/proxy.txt')).then(function (res) {
        return (0, spys_txt_1.parser)(String(res.data));
    });
}
exports.default = spys;
