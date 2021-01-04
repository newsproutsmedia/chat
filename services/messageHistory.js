let messages = [];
const MessageEmitter = require('../emitters/messageEmitter');
const logger = require('../loaders/logger');

module.exports = class MessageHistory {

    /**
     * @description add message to queue
     * @param {Object} message - object containing message user and text
     */
    static addMessageToHistory(message) {
        logger.info('[service.messageHistory.addMessageToHistory]', {message: "Adding message to history", text: message.text});
        messages.push(message);
    }

    static getRoomMessages(room) {
        const roomMessages = messages.filter(e => e.user.room.includes(room));
        logger.info('[service.messageHistory.getRoomMessages]', {messagesArrayLength: roomMessages.length});
        return roomMessages;
    }

    sendMessageHistoryToUser(room, socketIO) {
        const roomMessages = MessageHistory.getRoomMessages(room);
        if(!roomMessages) return false;
        logger.info('[service.messageHistory.sendMessageHistoryToUser]', {message: "sending message history"});
        roomMessages.forEach(message => {
            new MessageEmitter(socketIO).sendMessageToSender(message.user, message.text);
        });

        return true;
    }

    static deleteRoomMessages(room) {
        logger.info('[service.messageHistory.deleteRoomMessages]', {message: 'deleting room messages', room: room, messages: messages});
        messages = messages.filter(message => !message.user.room.includes(room));
        logger.info('[service.messageHistory.deleteRoomMessages]', {messages});
        return messages;
    }
}