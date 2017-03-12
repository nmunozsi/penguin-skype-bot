const builder = require('botbuilder');
const pify = require('pify');
const CONFIG = require('./src/config/env');
const db = require('./src/util/db');
const { bot } = require('./src/connector');
const { log, trace, error, debug } = require('./src/config/debug')(__filename);
// const { storeInDB, createAddressForUser } = require("./src/util/db");
// const parseMessage = require("./src/util/responses");

// BOT DIALOGS
bot.dialog('/', (session) => {
    log('Message received: "%s"', session.message.text);
    trace('%j', session.message.address);

    db.get('subscriptions')
    .then((s) => debug('%j', s));
});


const botSend = pify(bot.send.bind(bot), { multiArgs: true });

db.get('subscriptions')
.then((s) => debug('%j', s))
.catch(() => db.put('subscriptions', []));

setTimeout(() => {
    const msg = new builder.Message()
    .address(JSON.parse(CONFIG.TEST_CHANNEL_ADDRESS))
    .text('Hello');

    trace('%O', msg);

    botSend(msg)
    .then(() => log('Message sent!'))
    .catch((err) => error(err));
}, 2000);

process.on('unhandledRejection', (err) => {
    error(err.message);
    trace(err.stack);
    process.exit(1);
});

process.on('exit', () => log('Exited'));
