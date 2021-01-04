const logger = require('../loaders/logger');
const User = require('./user');
const MessageEmitter = require('../emitters/messageEmitter');
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
        this.user = User.getCurrentUserById(this.socket.id);
        this.messageCount = User.incrementUserMessageCount(this.user.id);
    }

    send() {
        logger.info("[service.message.sendMessage]", {info: "Sending Message"});
        // send message to user
        new MessageEmitter(this.socketIO).sendMessageToSender(this.user, this.text);
        // send message to everyone else
        new MessageEmitter(this.socketIO).sendMessageToAllOthersInRoom(this.user, this.text);
        // update message count for everyone
        new MessageEmitter(this.socketIO).emitToAllInRoom('updatedMessageCount', this.user.room, this.messageCount);
        // add message to history
        MessageHistory.addMessageToHistory({user: this.user, text: this.text});
    }

}