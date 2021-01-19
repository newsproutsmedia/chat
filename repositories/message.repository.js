let { messages } = require('../data/messages.data');
const logger = require('../loaders/logger');

/**
 * @description add message to queue
 * @param {Object} message - object containing message user and text
 */
function addMessageToHistory(message) {
    logger.info('[service.messageHistory.addMessageToHistory]', {message: "Adding message to history", text: message.text});
    messages.push(message);
}

function deleteMessagesByRoom(room) {
    logger.info('[service.messageHistory.deleteRoomMessages]', {message: 'deleting room messages', room: room, messages: messages});
    messages = messages.filter(message => !message.user.room.includes(room));
    logger.info('[service.messageHistory.deleteRoomMessages]', {messages});
    return messages;
}

function getMessagesByRoom(room) {
    const roomMessages = messages.filter(e => e.user.room.includes(room));
    logger.info('[service.messageHistory.getRoomMessages]', {messagesArrayLength: roomMessages.length});
    return roomMessages;
}

module.exports = { addMessageToHistory, deleteMessagesByRoom, getMessagesByRoom }