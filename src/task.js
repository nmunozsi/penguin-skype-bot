/**
 * Task class
 * Creates a new task for schedule
 */

const assert = require('assert');
const moment = require('moment');
const { DATE_FORMAT } = require('./config/env');
const { log, trace, error } = require('./config/debug')(__filename);

/**
 * Checks if task should be run now
 * @method mustRun
 * @param  {Object}     when    Moment object
 * @param  {Object}     now     Moment Object
 * @return {Boolean}
 */
function mustRun(when, now) {
    trace(
        'Checking if task must run. Scheduled for:%s now:%s',
        when.format(DATE_FORMAT),
        now.format(DATE_FORMAT)
    );

    return when.isSame(now, 'second');
}

module.exports = class Task {
    /**
     * Creates a new task
     * @param {Function}    task
     * @param {Object}      whenToRun
     */
    constructor(task, whenToRun) {
        assert(typeof task === 'function', 'Task is not a function');
        assert(moment.isMoment(whenToRun), 'Invalid moment object passed');

        this.task = task;
        this.whenToRun = whenToRun;
        log('New task created for %s', whenToRun.format(DATE_FORMAT));
    }

    /**
     * Updates task to see if it must run
     * @param {Object} now
     */
    update(now) {
        assert(moment.isMoment(now), 'Invalid moment object passed');

        if (mustRun(this.whenToRun, now)) {
            try {
                log('Running task at %s', now.format(DATE_FORMAT));
                this.task();
            } catch (err) {
                error('Task error', err);
            }
        }
    }
};
