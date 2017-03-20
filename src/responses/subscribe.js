const builder = require('botbuilder');
const { find } = require('lodash');
const db = require('./../util/db');
const { addSubscription } = require('./../subscription');
const { log, trace, error } = require('./../config/debug')(__filename);

module.exports = function suscribe(bot, address) {
    const msg = new builder.Message().address(address);

    db.get('subscriptions')
    .then((subscriptions) => {
        trace('Subscriptions: %O', subscriptions);

        if (find(subscriptions, ['conversation.id', address.conversation.id])) {
            log('Channel already subscribed:', address.conversation.id);
            msg.text('Ya estoy suscrito a este canal.');
            return Promise.resolve(true);
        }

        log('New channel subscribed!', address.conversation.id);
        msg.text(`<b>¡Hola!</b> Me he suscrito a este canal.\n\n
A partir de ahora, recibirás notificaciones diarias sobre quién no ha reportado.`);

        subscriptions.push(address);
        return db.put('subscriptions', subscriptions);
    })
    .then((subscriptions) => {
        trace('%O', subscriptions);

        if (!subscriptions) {
            addSubscription(address);
        }

        return bot.send(msg);
    })
    .catch((err) => error(err));
};
