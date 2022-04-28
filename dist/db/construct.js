"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var path_1 = __importStar(require("path"));
require("js-prototypes");
var fs_1 = require("fs");
var DBConstructor = (function () {
    function DBConstructor(folder) {
        this.debug = false;
        this.folder = folder;
    }
    DBConstructor.prototype.exists = function (key) {
        return (0, fs_1.existsSync)(this.locationfile(key));
    };
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
            if (isInt(value)) {
                content = 'number:' + Buffer.from(value.toString()).toString('base64');
            }
            else if (isFloat(value)) {
                content = 'float:' + Buffer.from(value.toString()).toString('base64');
            }
        }
        this.save(key, content);
    };
    DBConstructor.prototype.save = function (key, content) {
        if (!(0, fs_1.existsSync)((0, path_1.dirname)(this.locationfile(key))))
            (0, fs_1.mkdirSync)((0, path_1.dirname)(this.locationfile(key)), { recursive: true });
        (0, fs_1.writeFileSync)(this.locationfile(key), content);
    };
    DBConstructor.prototype.edit = function (key, newValue, by) {
        if (typeof by == 'object') {
            var get = this.get(key);
            if (Array.isArray(get)) {
                var getIndex = get.findIndex(function (predicate) {
                    if (objectEquals(predicate, by))
                        return true;
                    var keysBy = Object.keys(by);
                    var resultLoop = true;
                    for (var index = 0; index < keysBy.length; index++) {
                        var keyBy = keysBy[index];
                        resultLoop = resultLoop && predicate[keyBy] === by[keyBy];
                    }
                    if (resultLoop)
                        return true;
                });
                if (getIndex > -1) {
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
        return path_1.default.join(this.folder, key);
    };
    return DBConstructor;
}());
function objectEquals(x, y) {
    'use strict';
    if (x === null || x === undefined || y === null || y === undefined) {
        return x === y;
    }
    if (x.constructor !== y.constructor) {
        return false;
    }
    if (x instanceof Function) {
        return x === y;
    }
    if (x instanceof RegExp) {
        return x === y;
    }
    if (x === y || x.valueOf() === y.valueOf()) {
        return true;
    }
    if (Array.isArray(x) && x.length !== y.length) {
        return false;
    }
    if (x instanceof Date) {
        return false;
    }
    if (!(x instanceof Object)) {
        return false;
    }
    if (!(y instanceof Object)) {
        return false;
    }
    var p = Object.keys(x);
    return (Object.keys(y).every(function (i) {
        return p.indexOf(i) !== -1;
    }) &&
        p.every(function (i) {
            return objectEquals(x[i], y[i]);
        }));
}
module.exports = DBConstructor;
