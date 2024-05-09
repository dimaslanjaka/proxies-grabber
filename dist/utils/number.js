"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFloat = exports.isInt = void 0;
/**
 * is integer?
 * @param n
 * @returns
 */
function isInt(n) {
    return Number(n) === n && n % 1 === 0;
}
exports.isInt = isInt;
/**
 * is float?
 * @param n
 * @returns
 */
function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}
exports.isFloat = isFloat;
