const level = require('level');
const pify = require('pify');
const { resolve, join } = require('path');

const db = level(resolve(join(process.cwd(), '/database')), {
    valueEncoding: 'json'
});

module.exports = {
    get: pify(db.get.bind(db)),
    put: pify(db.put.bind(db)),
    close: pify(db.close.bind(db)),
    del: pify(db.del.bind(db)),
    batch: pify(db.batch.bind(db))
};
