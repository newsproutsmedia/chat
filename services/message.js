const logger = require('./logger');
const User = require('./user');
const formatMessage = require('../utils/formatting');

module.exports = class Message {

    constructor({socket, io, text}) {
        this.socket = socket;
        this.io = io;
        this.text = text;
        this.user = User.getCurrentUser(this.socket.id);
        this.messageCount = User.incrementUserMessageCount(this.user.id);

        // create message object
        this.currentMessage = {
            socket: this.socket,
            io: this.io,
            text: this.text,
            user: this.user,
            messageCount: this.messageCount
        }
        logger.info("service.message.constructor", {currentUser: this.user.username, currentMessage: this.currentMessage.text});
    }

    sendMessage() {
        logger.info("service.message.sendMessage", {info: "Sending Message"})
        // send message to user
        this._emitToCurrentUser(this.currentMessage);
        // send message to everyone else
        this._emitToRoomUsers(this.currentMessage);
        // update message count for everyone
        this._sendUpdatedMessageCount(this.currentMessage);
    }

    _emitToCurrentUser({socket, user, text}) {
        logger.info("service.message.emitToCurrentUser", {info: "Emit Message To Current Users", text});
        socket.emit('message', formatMessage(user, text));
    }

    _emitToRoomUsers({socket, user, text}) {
        logger.info("service.message.emitToRoomUsers", {info: "Emit Message To All Other Users", text});
        socket.to(user.room).emit('message', formatMessage(user, text));
    }

    _sendUpdatedMessageCount({io, user, messageCount}) {
        logger.info("service.message.sendUpdatedMessageCount", {info: "Send Updated Message Count To All Users", messageCount});
        io.in(user.room).emit('updatedMessageCount', messageCount);
    }

}