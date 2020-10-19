const { getCurrentUser, incrementUserMessageCount } = require('../utils/users');
const moment = require('moment');
const logger = require('../utils/logging');

module.exports = class Message {

    constructor({socket, io, text}) {
        logger.info("SERVICE.MESSAGE.CONSTRUCTOR");
        this.currentUser = socket.id;
        this.currentUserMessageCount = this.currentUser.id;

        // create message object
        this.currentMessage = {
            socket,
            io,
            text,
            user: this.currentUser,
            messageCount: this.currentUserMessageCount
        }
        logger.info("service.message.constructor", {currentUser: this.currentUser.username, currentMessage: this.currentMessage.text})
        this.sendMessage();
    }

    sendMessage() {
        logger.info("service.message.sendMessage", {info: "Sending Message"})
        // send message to user
        this.emitToCurrentUser(this.currentMessage);
        // send message to everyone else
        this.emitToRoomUsers(this.currentMessage);
        // update message count for everyone
        this.sendUpdatedMessageCount(this.currentMessage);
    }

    set currentUser(socketId) {
        logger.info("service.message.set.currentUser", {info: "Setting Current User", socketId})
        this.user = getCurrentUser(socketId);
    }

    get currentUser() {
        logger.info("service.message.get.currentUser", {info: "Getting Current User"});
        return this.user;
    }

    set currentUserMessageCount(userId) {
        logger.info("service.message.get.currentUser", {info: "Setting Current User Message Count"});
        this.messageCount = incrementUserMessageCount(userId);
    }

    get currentUserMessageCount() {
        logger.info("service.message.get.currentUser", {info: "Getting Current User Message Count"});
        return this.messageCount;
    }

    emitToCurrentUser({socket, user, text}) {
        logger.info("service.message.emitToCurrentUser", {info: "Emit Message To Current Users", text});
        socket.emit('message', Message.formatMessage(user, text));
    }

    emitToRoomUsers({socket, user, text}) {
        logger.info("service.message.emitToRoomUsers", {info: "Emit Message To All Other Users", text});
        socket.to(user.room).emit('message', Message.formatMessage(user, text));
    }

    sendUpdatedMessageCount({io, user, messageCount}) {
        logger.info("service.message.sendUpdatedMessageCount", {info: "Send Updated Message Count To All Users", messageCount});
        io.in(user.room).emit('updatedMessageCount', messageCount);
    }

    static formatMessage(user, text) {
        return {
            user,
            text,
            time: moment().format('h:mm a')
        }
    }

}