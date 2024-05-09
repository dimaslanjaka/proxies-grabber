"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyGrabber = exports.db = void 0;
var tslib_1 = require("tslib");
var core_1 = tslib_1.__importDefault(require("./core"));
exports.proxyGrabber = core_1.default;
var construct_1 = tslib_1.__importDefault(require("./db/construct"));
exports.db = construct_1.default;
/*exports = core;
exports.db = { db };
exports.default = core;*/
exports.default = core_1.default;
