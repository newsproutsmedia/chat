const SocketEmitter = require('./socketEmitter');
const addCurrentTime = require('../utils/time');

/**
 * @desc construct a new message emitter
 * @param {Object} socketIO - And object containing socket and io parameters
 * @param {Object} socketIO.socket - The socket object of the current user
 * @param {Object} socketIO.io - The io object of the current user
 */
module.exports = class MessageEmitter extends SocketEmitter {

    constructor(socketIO) {
        super(socketIO);
    }

    /**
     * @desc send a message back to the current user
     * @param {Object} user - current user object
     * @param {string} messageText - message text to send
     * @param {string} time - time message was sent
     */
    sendMessageToSender(user, messageText, time) {
        this.emitEventToSender('message', this._formatMessage(user, messageText, time));
    }

    /**
     * @desc send a message to all room users (EXCEPT sender)
     * @param {Object} user - current user object, must contain room
     * @requires {string} user.room - room id for passed user
     * @param {string} messageText - message text to send
     * @param {string} time - time message was sent
     */
    sendMessageToAllOthersInRoom(user, messageText, time) {
        this.emitToOthersInRoom('message', user.room, this._formatMessage(user, messageText, time));
    }

    /**
     * @desc format the message to be sent and add timestamp
     * @param {Object} user - current user object
     * @param {string} text - message text to be sent
     * @param {string} time - time message was sent
     */
    _formatMessage(user, text, time) {
        let message = {
            user,
            text,
            time
        }
        return message;
    }

}