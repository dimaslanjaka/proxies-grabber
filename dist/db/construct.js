"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var upath_1 = tslib_1.__importStar(require("upath"));
var fs_1 = require("fs");
var number_1 = require("../utils/number");
var DBConstructor = /** @class */ (function () {
    /**
     * Database File Constructor
     * @param folder folder to save entire databases
     */
    function DBConstructor(folder) {
        this.debug = false;
        this.folder = folder;
    }
    /**
     * check if data key on table exists
     * @param key
     * @returns
     */
    DBConstructor.prototype.exists = function (key) {
        return (0, fs_1.existsSync)(this.locationfile(key));
    };
    /**
     * add data to table
     * @param key
     * @param value
     */
    DBConstructor.prototype.push = function (key, value) {
        if (typeof value == 'undefined') {
            console.log('value undefined');
            return;
        }
        var content;
        content = typeof value + ':' + Buffer.from(value.toString()).toString('base64');
        if (Array.isArray(value)) {
            content = 'array:' + Buffer.from(JSON.stringify(value)).toString('base64');
        }
        else if (typeof value == 'object') {
            content = typeof value + ':' + Buffer.from(JSON.stringify(value)).toString('base64');
        }
        else if (typeof value == 'number') {
            if ((0, number_1.isInt)(value)) {
                content = 'number:' + Buffer.from(value.toString()).toString('base64');
            }
            else if ((0, number_1.isFloat)(value)) {
                content = 'float:' + Buffer.from(value.toString()).toString('base64');
            }
        }
        this.save(key, content);
    };
    DBConstructor.prototype.save = function (key, content) {
        if (!(0, fs_1.existsSync)((0, upath_1.dirname)(this.locationfile(key))))
            (0, fs_1.mkdirSync)((0, upath_1.dirname)(this.locationfile(key)), { recursive: true });
        (0, fs_1.writeFileSync)(this.locationfile(key), content);
    };
    /**
     * Edit database key
     * @param key
     * @param newValue
     * @param by
     * @returns
     */
    DBConstructor.prototype.edit = function (key, newValue, by) {
        if (typeof by == 'object') {
            var get = this.get(key);
            if (Array.isArray(get)) {
                /**
                 * get index array, if (-1) = not found
                 */
                var getIndex = get.findIndex(function (predicate) {
                    // if object by === predicate
                    if (objectEquals(predicate, by))
                        return true;
                    var keysBy = Object.keys(by);
                    var resultLoop = true;
                    for (var index = 0; index < keysBy.length; index++) {
                        var keyBy = keysBy[index];
                        // if not match, it return false (true && false)
                        resultLoop = resultLoop && predicate[keyBy] === by[keyBy];
                    }
                    if (resultLoop)
                        return true;
                });
                if (getIndex > -1) {
                    // set new value
                    get[getIndex] = newValue;
                    this.push(key, get);
                    return true;
                }
                else {
                    if (this.debug)
                        console.error('cannot find index ' + key, by);
                    return false;
                }
            }
        }
        else if (!by) {
            this.push(key, newValue);
            return true;
        }
        return false;
    };
    /**
     * get table database by key
     * @param key key table
     * @param fallback fallback value if not exists
     * @returns
     * @example
     * const nonExists = db.exists('/data-not-exists', 'default value');
     * console.log(nonExists); // default value
     */
    DBConstructor.prototype.get = function (key, fallback) {
        var ada = this.exists(key);
        if (!ada) {
            if (fallback)
                return fallback;
            return null;
        }
        var content = (0, fs_1.readFileSync)(this.locationfile(key)).toString().split(':');
        var value = Buffer.from(content[1], 'base64').toString('ascii');
        switch (content[0]) {
            case 'object':
            case 'array':
                return JSON.parse(value);
            case 'float':
                return parseFloat(value);
            case 'number':
                return parseInt(value);
            default:
                return value;
        }
    };
    DBConstructor.prototype.locationfile = function (key) {
        return upath_1.default.join(this.folder, key);
    };
    return DBConstructor;
}());
exports.default = DBConstructor;
function objectEquals(x, y) {
    'use strict';
    if (x === null || x === undefined || y === null || y === undefined) {
        return x === y;
    }
    // after this just checking type of one would be enough
    if (x.constructor !== y.constructor) {
        return false;
    }
    // if they are functions, they should exactly refer to same one (because of closures)
    if (x instanceof Function) {
        return x === y;
    }
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (x instanceof RegExp) {
        return x === y;
    }
    if (x === y || x.valueOf() === y.valueOf()) {
        return true;
    }
    if (Array.isArray(x) && x.length !== y.length) {
        return false;
    }
    // if they are dates, they must had equal valueOf
    if (x instanceof Date) {
        return false;
    }
    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) {
        return false;
    }
    if (!(y instanceof Object)) {
        return false;
    }
    // recursive object equality check
    var p = Object.keys(x);
    return (Object.keys(y).every(function (i) {
        return p.indexOf(i) !== -1;
    }) &&
        p.every(function (i) {
            return objectEquals(x[i], y[i]);
        }));
}
