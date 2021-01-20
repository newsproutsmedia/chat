const logger = require('../loaders/logger');

/**
 * @desc construct a new uncaught exception handler
 * @param {Object} socketIO - And object containing socket and io parameters
 */
module.exports = class UncaughtException {

    constructor() {
        this.onUncaughtException();
    }

    onUncaughtException() {
        process.on('uncaughtException', err => {
            logger.error('An uncaught exception occurred', err);
            process.exit(1);
        });
    }

}