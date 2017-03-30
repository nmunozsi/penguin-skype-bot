const { includes } = require('lodash');

module.exports = [
    {
        action: require('./unsubscribe'),
        match(msg) {
            return includes(msg.toLowerCase(), 'elimina la suscripcion') ||
                includes(msg.toLowerCase(), 'desuscribe');
        }
    },
    {
        action: require('./subscribe'),
        match(msg) {
            return includes(msg.toLowerCase(), 'suscribe');
        }
    },
    {
        action: require('./sendList'),
        match(msg) {
            return includes(msg.toLowerCase(), 'quien falta');
        }
    }
];
