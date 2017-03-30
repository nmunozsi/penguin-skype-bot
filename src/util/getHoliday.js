const moment = require('moment-timezone');
const fetch = require('node-fetch');
const { get } = require('lodash');
const CONFIG = require('../config/env');
const { log, trace, error } = require('../config/debug')(__filename);

/**
 * Call the Holidays API to get the years holidays
 * @param {Object} requestDate - Moment Object date of the needed date to be requested
 * @return {Promise} - Fetch Promise
 */
function getHoliday(requestDate) {
    return fetch(`${CONFIG.HOLIDAYS_API_URL}/CO/${requestDate.year()}}`)
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
            .filter((h) => h.isSameOrAfter(requestDate, 'day'))[0];

            log(`Next Colombian Holiday:`, holiday.format(CONFIG.DATE_FORMAT));

            return holiday;
        }
    });
}

module.exports = getHoliday;
