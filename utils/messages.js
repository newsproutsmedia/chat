const moment = require('moment');

function formatMessage(username, isUser, text) {
    return {
        username,
        isUser,
        text,
        time: moment().format('h:mm a')

    }
};

module.exports = formatMessage;