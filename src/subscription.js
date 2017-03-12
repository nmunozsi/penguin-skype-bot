const builder = require('botbuilder');
const moment = require('moment-timezone');
const business = require('moment-business');
const fetch = require('node-fetch');
const qs = require('querystring');
const { find, pull, get } = require('lodash');
const { bot } = require('./connector');
const CONFIG = require('./config/env');
const { log, trace, error } = require('./config/debug')(__filename);

/**
 * Store timeout references in memory
 * @type {Array}
 */
const TIMEOUTS = [];

/**
 * Adds a new timer
 * @method addTimer
 * @param  {Object} now
 * @param  {Object} nextDay
 * @param  {Object} holiday
 * @param  {Object} subscription Channel address
 */
function addTimer(now, nextDay, holiday, subscription) {
    const timeToNext = nextDay.valueOf() - now.valueOf();

    if (timeToNext < 0) {
        log('Next date is before now. Aborting.');
        return;
    }

    log('Current time: %s', now.format(CONFIG.DATE_FORMAT));
    log('Next message: %s (%d milliseconds)', nextDay.format(CONFIG.DATE_FORMAT), timeToNext);

    const found = find(TIMEOUTS, { channelId: subscription.channelId });

    if (found) {
        clearTimeout(found.timeout);
        pull(TIMEOUTS, found);
    }

    TIMEOUTS.push({
        channelId: subscription.channelId,
        timeout: setTimeout(() => {
            const today = moment().tz('US/Central');
            const lastBusinessDay = business.subtractWeekDays(today.clone(), 1);

            while (holiday.isSame(lastBusinessDay, 'day')) {
                log('Last business day was holiday. Going back one more day');
                business.subtractWeekDays(lastBusinessDay, 1);
            }

            log('Last business day:', lastBusinessDay.format(CONFIG.DATE_FORMAT));

            fetch(`${CONFIG.PENGUIN_REPORT_API}?date=${lastBusinessDay.format('YYYY-MM-DD')}`)
            .then((res) => res.json())
            .then((data) => {
                trace('%O', data);

                const penguined = data.filter((peep) => peep.totalHours < 7)
                .map((peep) => `\t🐧  ${peep['person-name']} (${peep.totalHours})`);

                let message = data.length ?
                'Todos reportaron horas. ¡Yay! 🙌' :
                'Hubo un error al llamar al API de Penguin Report. 😅';

                if (penguined.length) {
                    message = 'Las siguientes personas aún no han reportado horas:\r\n' +
                    penguined.join('\r\n') +
                    '\r\n' + CONFIG.PENGUIN_REPORT_URL;
                }

                const msg = new builder.Message()
                .address(subscription)
                .text('¡Buenos Días!\r\n' + message );

                trace('%O', msg);

                return bot.send(msg);
            })
            .then(() => {
                log('Programmed message sent!');
                addSubscription(subscription);
            })
            .catch((err) => error(err));
        }, timeToNext)
    });
}

/**
 * Adds a new timer to set morning message
 * @method addSubscription
 * @param  {Object} subscription Channel address
 */
function addSubscription(subscription) {
    log('Programming next message for: "%s"', subscription.channelId);

    const now = moment().tz('US/Central');
    // Get next business day
    const nextDay = business.addWeekDays(now.clone(), 1)
    .hour(8)
    .minute(30)
    // const nextDay = now.clone()
    // .hour(13)
    // .minute(20)
    .second(Math.floor(Math.random() * 60))
    .millisecond(0);

    const apiOptions = {
        key: CONFIG.HOLIDAYS_API_KEY,
        country: 'CO',
        year: now.year()
    };

    fetch(`${CONFIG.HOLIDAYS_API_URL}?${qs.stringify(apiOptions)}`)
    .then((res) => res.json())
    .catch((err) => {
        error(err);
        return Promise.resolve([]);
    })
    .then((response) => {
        trace(response);

        const holidays = get(response, 'holidays');

        if (holidays) {
            let holiday = Object.keys(holidays)
            .map((h) => moment(h))
            .filter((h) => h.isSameOrAfter(now, 'month'))[0];

            log('Next Colombian Holiday:', holiday.format(CONFIG.DATE_FORMAT));

            while (holiday.isSame(nextDay, 'day')) {
                log('Adding one more day to next day count');

                business.addWeekDays(nextDay, 1);
            }
        }

        addTimer(now, nextDay, holiday, subscription);
    });
}

module.exports = addSubscription;
