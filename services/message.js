const logger = require('../loaders/logger');
const userRepository = require('../repositories/user.repository');
const MessageEmitter = require('../emitters/messageEmitter');
const SocketEmitter = require('../emitters/socketEmitter');
const MessageHistory = require('../services/messageHistory');

/**
 * @desc construct a chat message
 * @param {Object} message, socket, io
 */
module.exports = class Message {

    constructor({text, socket, io}) {
        this.socket = socket;
        this.io = io;
        this.socketIO = {socket, io};
        this.text = text;
        this.user = userRepository.getCurrentUserById(this.socket.id);
        this.messageCount = userRepository.incrementUserMessageCount(this.user.id);
    }

    send() {
        logger.info("[service.message.sendMessage]", {info: "Sending Message"});
        // send message to user
        new MessageEmitter(this.socketIO).sendMessageToSender(this.user, this.text);
        // send message to everyone else
        new MessageEmitter(this.socketIO).sendMessageToAllOthersInRoom(this.user, this.text);
        // update message count for everyone
        new SocketEmitter(this.socketIO).emitToAllInRoom('updatedMessageCount', this.user.room, this.messageCount);
        // add message to history
        MessageHistory.addMessageToHistory({user: this.user, text: this.text});
    }

}