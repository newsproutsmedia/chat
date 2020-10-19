const moment = require('moment');
const logger = require('../utils/logging');

function formatMessage(user, text) {
    return {
        user,
        text,
        time: moment().format('h:mm a')
    }
};

module.exports = formatMessage;