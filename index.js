const { bot } = require('./src/connector');
const { find } = require('lodash');
const { log, trace, error } = require('./src/config/debug')(__filename);
const builder = require('botbuilder');
const db = require('./src/util/db');
const addSubscription = require('./src/subscription');

// BOT DIALOGS
bot.dialog('/', (session) => {
    log('Message received: "%s"', session.message.text);

    const address = session.message.address;
    trace('%O', address);

    db.get('subscriptions')
    .then((subscriptions) => {
        trace('%O', subscriptions);

        if (find(subscriptions, { channelId: address.channelId })) {
            log('Channel already subscribed:', address.channelId);
            return Promise.resolve(false);
        }

        log('New channel subscribed!', address.channelId);
        subscriptions.push(address);
        return db.put('subscriptions', subscriptions);
    })
    .then((subscriptions) => {
        trace('%O', subscriptions);

        if (!subscriptions) {
            return;
        }

        const msg = new builder.Message()
        .address(address)
        .text('¡Hola! Estoy suscrito a este canal');

        return bot.send(msg);
    })
    .catch((err) => error(err));
});

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
