let { messages } = require('../data/data');
const logger = require('../loaders/logger');

/**
 * @desc add message to queue
 * @param {Object} message - object containing message user and text
 */
function addMessageToHistory(message) {
    logger.info('[service.messageHistory.addMessageToHistory]', {message: "Adding message to history", text: message.text});
    messages.push(message);
}

/**
 * @desc delete all messages from a room
 * @param {string} room
 * @returns {array}
 */
function deleteMessagesByRoom(room) {
    logger.info('[service.messageHistory.deleteRoomMessages]', {message: 'deleting room messages', room: room, messages: messages});
    messages = messages.filter(message => !message.user.room.includes(room));
    logger.info('[service.messageHistory.deleteRoomMessages]', {messages});
    return messages;
}

/**
 * @desc get all messages from a specific room
 * @param {string} room
 * @returns {array}
 */
function getMessagesByRoom(room) {
    const roomMessages = messages.filter(e => e.user.room.includes(room));
    logger.info('[service.messageHistory.getRoomMessages]', {messagesArrayLength: roomMessages.length});
    return roomMessages;
}

module.exports = { addMessageToHistory, deleteMessagesByRoom, getMessagesByRoom }