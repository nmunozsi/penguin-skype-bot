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
 * Removes a subscription
 * @method removeSubscription
 * @param  {Object} subscription Subscription Object
 */
function removeSubscription(subscription) {
    const found = find(TASKS, { id: subscription.conversation.id });

    if (found) {
        log('Removing programmed message for: "%s"', found.id);
        clearInterval(found.tick);
        pull(TASKS, found);
    }
}

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

    log('Next message: %s (%d milliseconds). ChannelId: %s',
        nextDay.format(CONFIG.DATE_FORMAT),
        timeToNext,
        subscription.conversation.id
    );

    removeSubscription(subscription);

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
            } else {
                message = 'Todos reportaron horas. ¡Yay! 🙌';
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
    let nextDay = now.clone().hour(8).minute(30);

    log('Current time: %s', now.format(CONFIG.DATE_FORMAT));

    while (business.isWeekendDay(nextDay)) {
        log('Next day is a weekend day. Adding one day to the count');
        nextDay = business.addWeekDays(nextDay, 1);
    }

    // Get next business day if after 8:30 am
    if (now.isSameOrAfter(nextDay, 'minute')) {
        log('After 8:30 am. Adding one day to next day count');
        nextDay = business.addWeekDays(nextDay, 1);
    }

    nextDay
    .second(Math.floor(Math.random() * 60))
    .millisecond(0);

    fetch(`${CONFIG.HOLIDAYS_API_URL}/CO/${nextDay.year()}}`)
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

module.exports = { addSubscription, removeSubscription };
