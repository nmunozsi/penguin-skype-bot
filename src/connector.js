const CONFIG = require('./config/env');
const restify = require('restify');
const builder = require('botbuilder');
const assert = require('assert');
const pify = require('pify');

const { log } = require('./config/debug')(__filename);

let _connector;
let server;

if (CONFIG.ENV !== 'local') {
    _connector = new builder.ChatConnector({
        appId: CONFIG.APP_ID,
        appPassword: CONFIG.APP_PWD
    });

    // Restify
    server = restify.createServer();

    server.use(restify.queryParser());

    assert(CONFIG.APP_ID, 'No App ID set!');
    assert(CONFIG.APP_PWD, 'No App Pwd set!');

    server.post('/api/messages', _connector.listen());

    // Routes
    require('./routes')(server);

    // Init server
    server.listen(CONFIG.port || CONFIG.PORT, function () {
        log('%s listening to %s', server.name, server.url);
    });
} else {
    log('Starting console client');
    _connector = new builder.ConsoleConnector().listen();
}

// Bot
const bot = new builder.UniversalBot(_connector);
bot.send = pify(bot.send.bind(bot));

module.exports = { bot, server };
