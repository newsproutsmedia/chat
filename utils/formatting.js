const moment = require('moment');

/**
 * @desc takes an array of recipients to construct an email
 * @param user, text Obj, string
 * @return {user, text, time} Obj
 */
function formatMessage(user, text) {
    return {
        user,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMessage;