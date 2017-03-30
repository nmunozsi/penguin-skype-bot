const moment = require('moment-timezone');
const business = require('moment-business');
const { find, pull } = require('lodash');
const CONFIG = require('./config/env');
const { log, error } = require('./config/debug')(__filename);
const Task = require('./task');
const sendMessage = require('./util/sendMessage');
const getHoliday = require('./util/getHoliday');

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
        sendMessage(holiday, subscription)
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

    getHoliday(nextDay)
    .then((holiday) => {
       if (holiday) {
           while (holiday.isSame(nextDay, 'day')) {
                log('Adding one more day to next day count');

                business.addWeekDays(nextDay, 1);
            }
       }

       scheduleMessage(now, nextDay, holiday, subscription);
    });
}

module.exports = { addSubscription, removeSubscription };
