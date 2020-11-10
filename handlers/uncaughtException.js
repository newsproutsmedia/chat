const logger = require('../loaders/logger');
const SocketEmitter = require('../emitters/socketEmitter');

/**
 * @desc construct a new uncaught exception handler
 * @param {Object} socketIO - And object containing socket and io parameters
 */
module.exports = class UncaughtException {

    constructor(socketIO) {
        this.socketIO = socketIO;
        this.onUncaughtException();
    }

    onUncaughtException() {
        process.on('uncaughtException', err => {
            logger.error('An uncaught exception occurred', err);
            //TODO redirect user on fatal error
            this._notifyOfError(err);
            process.exit(1);
        });
    }

    _notifyOfError(err) {
        logger.error('Emitting fatalError', err);
        const emitter = new SocketEmitter(this.socketIO);
        emitter.emitEventToSender('fatalError', {error: err});
    }

}