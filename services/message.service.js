const logger = require('../loaders/logger');
const userRepository = require('../repositories/user.repository');
const MessageEmitter = require('../emitters/messageEmitter');
const SocketEmitter = require('../emitters/socketEmitter');
const messageRepository = require('../repositories/message.repository');

function send({user, text, time, socket, io}) {
    const socketIO = {socket, io};
    logger.info("[service.message.sendMessage]", {info: "Sending Message", user, text, time});

    messageRepository.addMessageToHistory({user, text, time});

    new MessageEmitter(socketIO).sendMessageToSender(user, text, time);

    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(user, text, time);
    const messageCount = userRepository.incrementUserMessageCount(user.id);

    new SocketEmitter(socketIO).emitToAllInRoom('updatedMessageCount', user.room, messageCount);

}

function sendMessageHistoryToUser(room, socketIO) {
    const roomMessages = messageRepository.getMessagesByRoom(room);
    if(!roomMessages) {
        logger.info('[service.messageHistory.sendMessageHistoryToUser]', {message: "no messages to send"});
        return false;
    }
    logger.info('[service.messageHistory.sendMessageHistoryToUser]', {message: "sending message history"});
    roomMessages.forEach(message => {
        new MessageEmitter(socketIO).sendMessageToSender(message.user, message.text, message.time);
    });

    return true;
}

module.exports = { send, sendMessageHistoryToUser }