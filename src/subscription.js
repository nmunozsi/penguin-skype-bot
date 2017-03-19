const builder = require('botbuilder');
const moment = require('moment-timezone');
const business = require('moment-business');
const fetch = require('node-fetch');
const { find, pull, get } = require('lodash');
const { bot } = require('./connector');
const CONFIG = require('./config/env');
const { log, trace, error } = require('./config/debug')(__filename);
const Task = require('./task');

/**
 * Store timeout references in memory
 * @type {Array}
 */
const TASKS = [];

/**
 * Schedules message
 * @method scheduleMessage
 * @param  {Object} now
 * @param  {Object} nextDay
 * @param  {Object} holiday
 * @param  {Object} subscription Channel address
 */
function scheduleMessage(now, nextDay, holiday, subscription) {
    const timeToNext = nextDay.valueOf() - now.valueOf();

    if (timeToNext < 0) {
        log('Next date is before now. Aborting.');
        return;
    }

    log('Current time: %s', now.format(CONFIG.DATE_FORMAT));
    log('Next message: %s (%d milliseconds). ChannelId: %s',
        nextDay.format(CONFIG.DATE_FORMAT),
        timeToNext,
        subscription.conversation.id
    );

    const found = find(TASKS, { id: subscription.conversation.id });

    if (found) {
        clearInterval(found.tick);
        pull(TASKS, found);
    }

    const task = new Task(() => {
        const today = moment().tz('US/Central');
        const lastBusinessDay = business.subtractWeekDays(today.clone(), 1);

        if (holiday) {
            while (holiday.isSame(lastBusinessDay, 'day')) {
                log('Last business day was holiday. Going back one more day');
                business.subtractWeekDays(lastBusinessDay, 1);
            }
        }

        log('Last business day:', lastBusinessDay.format(CONFIG.DATE_FORMAT));

        fetch(`${CONFIG.PENGUIN_REPORT_API}?date=${lastBusinessDay.format('YYYY-MM-DD')}`)
        .then((res) => res.json())
        .then((data) => {
            trace('%O', data);

            const penguined = data.filter((peep) => peep.totalHours < 7)
            .map((peep) => `🐧  <b>${peep['person-name']}</b> (${peep.totalHours} horas)`);

            let message = data.length ?
            'Todos reportaron horas. ¡Yay! 🙌' :
            'Hubo un error al llamar al API de Penguin Report. 😅';

            if (penguined.length) {
                message = 'Las siguientes personas aún no han reportado horas:\n\n' +
                penguined.join('\n\n') +
                '\n\n---\n\n' + CONFIG.PENGUIN_REPORT_URL;
            }

            const msg = new builder.Message()
            .address(subscription)
            .text('¡Buenos Días!\n\n' + message );

            trace('%O', msg);

            return bot.send(msg);
        })
        .then(() => {
            log('Programmed message sent!');
            addSubscription(subscription);
        })
        .catch((err) => error(err));
    }, nextDay);

    TASKS.push({
        id: subscription.conversation.id,
        tick: setInterval(() => task.update(moment()), 1000)
    });
}

/**
 * Adds a new timer to set morning message
 * @method addSubscription
 * @param  {Object} subscription Channel address
 */
function addSubscription(subscription) {
    log('Programming next message for: "%s"', subscription.conversation.id);

    const now = moment().tz('US/Central');
    // Get next business day
    const nextDay = business.addWeekDays(now.clone(), 1)
    .hour(8)
    .minute(30)
    // const nextDay = now.clone()
    // .minute(now.minute() + 1)
    .second(Math.floor(Math.random() * 60))
    .millisecond(0);

    fetch(`${CONFIG.HOLIDAYS_API_URL}/CO/${now.year()}}`)
    .then((res) => res.json())
    .catch((err) => {
        error(err);
        return Promise.resolve([]);
    })
    .then((response) => {
        trace(response);

        const holidays = get(response, 'holidays');
        let holiday;

        if (holidays) {
            holiday = holidays
            .map((h) => moment(h.date))
            .filter((h) => h.isSameOrAfter(now, 'month'))[0];

            log('Next Colombian Holiday:', holiday.format(CONFIG.DATE_FORMAT));

            while (holiday.isSame(nextDay, 'day')) {
                log('Adding one more day to next day count');

                business.addWeekDays(nextDay, 1);
            }
        }

        scheduleMessage(now, nextDay, holiday, subscription);
    });
}

module.exports = addSubscription;