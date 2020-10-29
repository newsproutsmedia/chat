const moment = require('moment');

/**
 * @desc takes an object and adds a time parameter with current time
 * @param object Obj
 * @return {..., time} Obj
 */
function addCurrentTime(object) {
    object.time = moment().format('h:mm a');
    return object;
}

module.exports = addCurrentTime;