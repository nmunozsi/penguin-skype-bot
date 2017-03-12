const { bot } = require('./src/connector');
const { find } = require('lodash');
const { log, trace, error } = require('./src/config/debug')(__filename);
const builder = require('botbuilder');
const db = require('./src/util/db');
const addSubscription = require('./src/subscription');
const CONFIG = require('./src/config/env');

// BOT DIALOGS
bot.dialog('/', (session) => {
    log('Message received: "%s"', session.message.text);

    const address = session.message.address;
    trace('Address: %O', address);

    db.get('subscriptions')
    .then((subscriptions) => {
        trace('Subscriptions: %O', subscriptions);

        if (find(subscriptions, ['conversation.id', address.conversation.id])) {
            log('Channel already subscribed:', address.conversation.id);
            return Promise.resolve(true);
        }

        log('New channel subscribed!', address.conversation.id);
        subscriptions.push(address);
        return db.put('subscriptions', subscriptions);
    })
    .then((subscriptions) => {
        trace('%O', subscriptions);

        if (subscriptions) {
            return;
        }

        const msg = new builder.Message()
        .address(address)
        .text('¡Hola! Estoy suscrito a este canal');

        addSubscription(address);

        return bot.send(msg);
    })
    .catch((err) => error(err));
});

if (CONFIG.WIPE_DB) {
    db.put('subscriptions', []);
}

// Sets intervals to send messages in the morning
db.get('subscriptions')
.then((subscriptions) => {
    trace('%O', subscriptions);

    subscriptions.forEach(addSubscription);
})
.catch((err) => {
    error(err);
    if (err.type === 'NotFoundError', db.put('subscriptions', []));
});

process.on('unhandledRejection', (err) => {
    error(err.message);
    trace(err.stack);
    process.exit(1);
});

process.on('exit', () => log('Exited'));
