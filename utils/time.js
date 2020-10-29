const moment = require('moment');

/**
 * @desc takes an object and adds a time parameter with current time
 * @param {Object} object
 * @returns {Object} object - returns object that now includes timestamp param
 */
function addCurrentTime(object) {
    object.time = moment().format('h:mm a');
    return object;
}

module.exports = addCurrentTime;