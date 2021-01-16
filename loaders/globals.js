const appName = process.env.APP_NAME || "ChatApp";
const bot = { username: appName, type: 'bot' };
const userTypes = new Set(['admin', 'user', 'bot']);
const disconnectTimeout = 10000;

/**
 * @desc get global appName
 * @returns {*|string}
 */
function getAppName() {
    return appName;
}

/**
 * @desc get global bot object, contains appName
 * @returns {*|Object}
 */
function getBot() {
    return bot;
}

/**
 * @desc get global userTypes array
 * @returns {*|Array}
 */
function getUserTypes() {
    return userTypes;
}

/**
 * @desc get global disconnect timeout in ms
 * @returns {*|number}
 */
function getDisconnectTimeout() {
    return disconnectTimeout;
}

module.exports = { getAppName, getBot, getUserTypes, getDisconnectTimeout};