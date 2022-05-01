import core from './core';
import db from './db/construct';

/*exports = core;
exports.db = { db };
exports.default = core;*/
export default core;
export { db, core as proxyGrabber };
