const appName = process.env.APP_NAME || "ChatApp";
const bot = { username: appName, type: 'bot' };
const userTypes = new Set(['admin', 'user', 'bot']);
const disconnectTimeout = 1000;

module.exports = { appName, bot, userTypes, disconnectTimeout };