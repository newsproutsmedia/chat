const logger = require('../loaders/logger');
const userRepository = require('../repositories/user.repository');
const MessageEmitter = require('../emitters/messageEmitter');
const SocketEmitter = require('../emitters/socketEmitter');
const messageRepository = require('../repositories/message.repository');

function send({user, text, socket, io}) {
    const socketIO = {socket, io};
    logger.info("[service.message.sendMessage]", {info: "Sending Message", user, text});
    // add message to history
    messageRepository.addMessageToHistory({user, text});
    // send message to user
    new MessageEmitter(socketIO).sendMessageToSender(user, text);
    // send message to everyone else
    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(user, text);
    const messageCount = userRepository.incrementUserMessageCount(user.id);
    // update message count for everyone
    new SocketEmitter(socketIO).emitToAllInRoom('updatedMessageCount', user.room, messageCount);

}

function sendMessageHistoryToUser(room, socketIO) {
    const roomMessages = messageRepository.getMessagesByRoom(room);
    if(!roomMessages.length) {
        logger.info('[service.messageHistory.sendMessageHistoryToUser]', {message: "no messages to send"});
        return false;
    }
    logger.info('[service.messageHistory.sendMessageHistoryToUser]', {message: "sending message history"});
    roomMessages.forEach(message => {
        new MessageEmitter(socketIO).sendMessageToSender(message.user, message.text);
    });

    return true;
}

module.exports = { send, sendMessageHistoryToUser }