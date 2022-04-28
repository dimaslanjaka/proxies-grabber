"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var core_1 = __importDefault(require("./core"));
var construct_1 = __importDefault(require("./db/construct"));
exports.db = construct_1.default;
exports = core_1.default;
exports.default = core_1.default;
