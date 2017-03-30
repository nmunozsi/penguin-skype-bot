const moment = require('moment-timezone');
const sendMessage = require('../util/sendMessage');
const getHoliday = require('../util/getHoliday');
const { error } = require('../config/debug')(__filename);

module.exports = function suscribe(bot, address) {
    const now = moment().tz('US/Central');

    getHoliday(now)
    .then((holiday) => {
        sendMessage(holiday, address);
    })
    .catch((err) => error(err));
};
