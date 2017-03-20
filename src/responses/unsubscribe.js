const builder = require('botbuilder');
const { find, pull } = require('lodash');
const db = require('./../util/db');
const { removeSubscription } = require('./../subscription');
const { log, trace, error } = require('./../config/debug')(__filename);

module.exports = function unsubscribe(bot, address) {
    const msg = new builder.Message().address(address);

    db.get('subscriptions')
    .then((subscriptions) => {
        trace('Subscriptions: %O', subscriptions);

        const found = find(subscriptions, ['conversation.id', address.conversation.id]);

        if (!found) {
            log('Channel does not exist:', address.conversation.id);
            msg.text('Todavía no estoy suscrito a este canal. ☹️');
            return Promise.resolve(true);
        }

        log('Channel unsubscribed "%s"', found.conversation.id);
        msg.text(`He removido la suscripción de este canal.\n\n
No recibirás más notificaciones diarias.`);

        pull(subscriptions, found);
        return db.put('subscriptions', subscriptions);
    })
    .then((subscriptions) => {
        trace('%O', subscriptions);

        if (!subscriptions) {
            removeSubscription(address);
        }

        return bot.send(msg);
    })
    .catch((err) => error(err));
};
