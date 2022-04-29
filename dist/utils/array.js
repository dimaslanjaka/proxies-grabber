"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueArrayByObjectKey = exports.shuffle = void 0;
var tslib_1 = require("tslib");
/**
 * shuffle array
 * @param array
 * @returns
 */
function shuffle(array) {
    return array.sort(function () { return Math.random() - 0.5; });
}
exports.shuffle = shuffle;
/**
 * unique array of object by the object key
 * @param array
 * @param key
 * @returns
 */
function uniqueArrayByObjectKey(array, key) {
    return tslib_1.__spreadArray([], tslib_1.__read(new Map(array.map(function (item) { return [item[key], item]; })).values()), false);
}
exports.uniqueArrayByObjectKey = uniqueArrayByObjectKey;
