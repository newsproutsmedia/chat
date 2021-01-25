const moment = require('moment');

/**
 * @desc takes an object and adds a time parameter with current time
 * @returns {string} time - returns current time
 */
function getCurrentTime() {
    return moment().format('h:mm a');
}

module.exports = { getCurrentTime };