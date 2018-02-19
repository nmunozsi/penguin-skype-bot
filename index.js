const { bot } = require('./src/connector');
const { log, trace, error } = require('./src/config/debug')(__filename);
const db = require('./src/util/db');
const { addSubscription } = require('./src/subscription');
const CONFIG = require('./src/config/env');
const RESPONSES = require('./src/responses');

// BOT DIALOGS
bot.dialog('/', (session) => {
    const address = session.message.address;
    trace('Address: %O', address);

    // Trying to perform action
    const hasResponse = RESPONSES.some((response) => {
        if (response.match(session.message.text)) {
            log('Bot response found for: "%s"', session.message.text);
            response.action(bot, address);
            return true;
        }
    });

    if (!hasResponse) {
        log('No response found for "%s"', session.message.text);
    }
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
