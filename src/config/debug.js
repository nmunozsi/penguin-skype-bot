const debug = require('debug');
const { partial, includes } = require('lodash');
const CONFIG = require('./env');

const LEVELS = [
    'error',
    'warn',
    'info',
    'log',
    'debug',
    'trace'
];

const OFF_VALUES = [
    'null',
    'undefined',
    'false',
    'off',
    ''
];

const levelAsString = LEVELS
.map((level) => `${level}:*`)
.reduce((logLevel, next) => {
    if (includes(OFF_VALUES, CONFIG.LOG_LEVEL)) {
        return '';
    }

    if (includes(logLevel, CONFIG.LOG_LEVEL)) {
        return logLevel;
    }

    return `${logLevel},${next}`;
});

const additionalDebug = CONFIG.DEBUG ? `,${CONFIG.DEBUG}` : '';

debug.enable(levelAsString + additionalDebug);

module.exports = function (filepath = '') {
    const path = filepath.replace(process.cwd(), '');

    return {
        error: partial(debug(`error:${path}`), '🛑  '),
        warn: partial(debug(`warn:${path}`), '⚠️  '),
        info: partial(debug(`info:${path}`), '🔎  '),
        log: debug(`log:${path}`),
        debug: debug(`debug:${path}`),
        trace: debug(`trace:${path}`)
    };
};
