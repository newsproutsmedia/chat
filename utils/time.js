const moment = require('moment');

/**
 * @desc takes an object and adds a time parameter with current time
 * @returns {string} time - returns object that now includes timestamp param
 */
function getCurrentTime() {
    return moment().format('h:mm a');
}

module.exports = { getCurrentTime };