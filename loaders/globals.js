let appName = process.env.APP_NAME || "ChatApp";
let bot = { username: appName, type: 'bot' };
const userTypes = new Set(['admin', 'user', 'bot']);

module.exports = { appName, bot, userTypes };