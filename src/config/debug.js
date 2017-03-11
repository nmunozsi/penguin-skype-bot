const debug = require('debug');
const { partial } = require('lodash');
const CONFIG = require('./env');

debug.enable(CONFIG.LOG_LEVEL);

module.exports = function (filepath = '') {
    const path = filepath.replace(process.cwd(), '');

    return {
        log: debug(`log:${path}`),
        warn: partial(debug(`warn:${path}`), '⚠️'),
        error: partial(debug(`error:${path}`), '🛑'),
        info: partial(debug(`info:${path}`), '🔎'),
        trace: debug(`trace:${path}`)
    };
};
