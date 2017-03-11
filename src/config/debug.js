const debug = require('debug');
const { partial } = require('lodash');

module.exports = function (filepath = '') {
    const path = filepath.replace(process.cwd(), '');

    return {
        log: debug(`${path}:log`),
        warn: partial(debug(`${path}:warn`), '⚠️'),
        error: partial(debug(`${path}:error`), '🛑'),
        info: partial(debug(`${path}:log`), '🔎'),
        trace: partial(debug(`${path}:trace`), '🚦')
    };
};
