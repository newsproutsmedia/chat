let appName = process.env.APP_NAME || "ChatApp";
let bot = { username: appName, type: 'bot' };

module.exports = { appName, bot };