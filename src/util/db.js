const level = require('level');
const pify = require('pify');
const { resolve, join } = require('path');
const { DB_NAME, DB_PATH } = require('./../config/env');

const db = level(resolve(join(DB_PATH || process.cwd(), '/' + DB_NAME)), {
    valueEncoding: 'json'
});

module.exports = {
    get: pify(db.get.bind(db)),
    put: pify(db.put.bind(db)),
    close: pify(db.close.bind(db)),
    del: pify(db.del.bind(db)),
    batch: pify(db.batch.bind(db))
};
