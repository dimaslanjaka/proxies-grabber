"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = void 0;
require("js-prototypes");
function parse(data) {
    var result = data
        .split('\n')
        .trim()
        .filter(function (str) {
        if (!str.match(/^\d/)) {
            return false;
        }
        return true;
    })
        .map(function (str) {
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
        var parse = str.split(/\s/);
        buildObject.proxy = parse[0];
        if (parse[1].includes('!')) {
            buildObject.alert = true;
            parse[1] = parse[1].replace('!', '');
        }
        else {
            buildObject.alert = false;
        }
        var ctr = parse[1].split('-');
        buildObject.code = ctr[0];
        buildObject.anonymity = ctr[1];
        if (typeof ctr[2] == 'string')
            buildObject.ssl = true;
        if (parse[2] == '+') {
            buildObject.google = true;
        }
        else {
            buildObject.google = false;
        }
        return buildObject;
    });
    return result;
}
exports.default = parse;
exports.parser = parse;
