//module.exports = require('./src/core');
//module.exports.default = require('./src/core');
//module.exports.db = require('./src/db/construct');

import core from './core';
import db from './db/construct';

exports = core;
//exports.default = core;
//exports.db = db;
export default core;
export { db };
