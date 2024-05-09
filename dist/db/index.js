"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var construct_1 = tslib_1.__importDefault(require("./construct"));
//https://www.npmjs.com/package/node-json-db
var getNodeVersion = parseInt(process.version.toLowerCase().replace('v', ''));
exports.default = construct_1.default;
