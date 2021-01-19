const logger = require('../loaders/logger');
const Room = require('../models/room');
const userService = require('../services/user.service');
const userRepository = require('../repositories/user.repository');
const roomRepository = require('../repositories/room.repository');
const messageService = require('../services/message.service');
const messageRepository = require('../repositories/message.repository');
const EventEmitter = require('events');
const MessageEmitter = require('../emitters/messageEmitter');
const SocketEmitter = require('../emitters/socketEmitter');
let {getBot} = require('../loaders/globals');

function createRoom() {
    const room = new Room();
    roomRepository.addRoom(room.getId());
    logger.info("[service.room.createRoom]", {room: room.getId()});
    return room;
}

function join({email, room, socket, io}) {

    const socketIO = {socket, io};
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    const userIndex = userRepository.getUserIndexById(user.id);

    logger.info("[service.room.joinRoom]", {room: room});
    socket.join(room);

    userRepository.setUserSocket(userIndex, socket.id);
    userRepository.setUserStatus(userIndex, "ONLINE");

    // welcome current user
    emitWelcome(user, socketIO);

    // broadcast to everyone (except user) when user connects
    broadcastJoinedMessage(user, socketIO);

    // set up admin tools
    emitSetupAdmin(user, socketIO);

    // send users and room info to front end
    userService.sendRoomUsers(room, socketIO);

    // send message history to front end
    messageService.sendMessageHistoryToUser(room, socketIO);

}

function reconnect({email, room, socket, io}) {
    const socketIO = {socket, io};
    // stop disconnect countdown
    const stopTimerEmitter = new EventEmitter();
    stopTimerEmitter.emit("stopTimer");

    // update userID
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    const userIndex = userRepository.getUserIndexById(user.id);
    logger.info("[service.room.reconnect]", {user});
    userRepository.setUserSocket(userIndex, socket.id);

    // update connection status
    userRepository.setUserStatus(userIndex, "ONLINE");

    // rejoin room
    logger.info("[service.room.reconnect]", {room: room});
    socket.join(room);

    // emit reconnect event
    emitReconnect(user, socketIO);

    // broadcast to everyone (except user) when user connects
    broadcastReconnectMessage(user, socketIO);

    // set up admin tools
    emitSetupAdmin(user, socketIO);

    // send users and room info to front end
    userService.sendRoomUsers(room, socketIO);

    // send message history to front end
    messageService.sendMessageHistoryToUser(room, socketIO);
}

/**
 * @desc remove all clients and destroy room
 * @param {Object} socketIO - socket and io params
 * @param {string} room - id of room
 */
function destroyRoom({socket, io}, room) {
    logger.info('[service.room.destroyRoom]', {message: 'performing room cleanup', room});
    messageRepository.deleteMessagesByRoom(room);
    userRepository.deleteAllUsersFromRoom(room);
    roomRepository.deleteRoom(room);
}

function emitWelcome({id, email, room}, socketIO) {
    const user = {...getBot(), room};
    const text = 'Welcome to Chat!';
    logger.info("[service.room.emitWelcome]", {id, email, room});
    new MessageEmitter(socketIO).sendMessageToSender(user, text);
}

function emitReconnect({room}, socketIO) {
    const user = {...getBot(), room};
    const text = 'Welcome Back';
    logger.info("[service.room.emitReconnect.welcomeBack]", {user, text});
    new MessageEmitter(socketIO).sendMessageToSender(user, text);
    logger.info("service.room.emitReconnect.reconnect", {room});
    new SocketEmitter(socketIO).emitEventToSender('reconnect', {message: text});
}

function broadcastJoinedMessage({id, username, email, room}, socketIO) {
    const user = {...getBot(), room};
    const text = `${username} has joined the chat`;
    logger.info("[service.room.emitJoinedMessage]", {id, username, email, room});
    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(user, text);
}

function broadcastReconnectMessage({id, username, email, room}, socketIO) {
    const user = {...getBot(), room};
    const text = `${username} has rejoined the chat`;
    logger.info("[service.room.emitReconnectMessage]", {id, username, email, room});
    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(user, text);
}

function emitSetupAdmin(user, socketIO) {
    logger.info("[service.room.emitSetupAdmin]", {user});
    new SocketEmitter(socketIO).emitEventToSender('setupAdmin', user);
}

module.exports = { createRoom, join, reconnect, destroyRoom };