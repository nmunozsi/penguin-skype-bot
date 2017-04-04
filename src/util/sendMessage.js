const moment = require('moment-timezone');
const business = require('moment-business');
const fetch = require('node-fetch');
const { log, trace } = require('../config/debug')(__filename);
const CONFIG = require('../config/env');
const builder = require('botbuilder');
const { bot } = require('../connector');

/**
 * Get data from Basecamp and sends the message
 * @param {Boolean} holiday - Whether last day is a holiday
 * @param {Object} subscription - Subscription Object
 * @param {Boolean} automated - Whether is triggered by someone or is a scheduled called
 * @return {Promise} - Fetch data promise
 */
function sendMessage(holiday, subscription, automated = true) {
    const today = moment().tz('US/Central');
    const lastBusinessDay = business.subtractWeekDays(today.clone(), 1);

    if (holiday) {
        while (holiday.isSame(lastBusinessDay, 'day')) {
            log('Last business day was holiday. Going back one more day');
            business.subtractWeekDays(lastBusinessDay, 1);
        }
    }

    log('Last business day:', lastBusinessDay.format(CONFIG.DATE_FORMAT));

    return fetch(`${CONFIG.PENGUIN_REPORT_API}?date=${lastBusinessDay.format('YYYY-MM-DD')}`)
        .then((res) => res.json())
        .then((data) => {
            trace('%O', data);

            let message;

            if (!data) {
                message = 'Hubo un error al llamar al API de Penguin Report. 😅';
            }

            const penguined = data.filter((peep) => peep.totalHours < 7)
            .map((peep) => `🐧  <b>${peep['person-name']}</b> (${peep.totalHours} horas)`);

            if (penguined.length) {
                message = 'Las siguientes personas aún no han reportado horas:\n\n' +
                penguined.join('\n\n') +
                '\n\n---\n\n' + CONFIG.PENGUIN_REPORT_URL +
                '?date=' + lastBusinessDay.format('YYYY-MM-DD');
                message = message.replace('Maria Antonia Serna', 'ANTONIA!!!!');
            } else {
                message = '¡Hemos Cumplido! 🙌 \n\n' +
                'https://1.bp.blogspot.com/-cQ0b6am0ckc/WIEbGsVjH2I/AAAAAAAAAMI/' +
                '8W0wdpRdGNYCOfU2I1TD3NK2mIbqiI3QACLcB/s320/hemoscumplido.jpg';
            }

            const msg = new builder.Message()
            .address(subscription)
            .text((automated ? '¡Buenos Días!\n\n' : '') + message );

            trace('%O', msg);

            return bot.send(msg);
        });
}

module.exports = sendMessage;
