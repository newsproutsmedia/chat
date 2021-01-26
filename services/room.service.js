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
const {getCurrentTime} = require('../utils/time');

/**
 * @desc create a new room
 * @returns {Object} room
 */
function createRoom() {
    const room = new Room();
    roomRepository.addRoom(room.getId());
    logger.info("[service.room.createRoom]", {room: room.getId()});
    return room;
}

/**
 * @desc join user to room socket and room
 * @typedef {Object} user
 * @property {string} email
 * @property {string} room
 * @property {Object} socket
 * @property {Object} io
 */
function join({email, room, socket, io}) {

    const socketIO = {socket, io};
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    const userIndex = userRepository.getUserIndexById(user.id);

    logger.info("[service.room.joinRoom]", {room: room});
    socket.join(room);

    userRepository.setUserSocket(userIndex, socket.id);
    userRepository.setUserStatus(userIndex, "ONLINE");

    emitWelcome(user, socketIO);

    broadcastJoinedMessage(user, socketIO);

    emitSetupAdmin(user, socketIO);

    userService.sendRoomUsers(room, socketIO);

    messageService.sendMessageHistoryToUser(room, socketIO);

}

/**
 * @desc reconnect user to socket and room
 * @typedef {Object} user
 * @property {string} email
 * @property {string} room
 * @property {Object} socket
 * @property {Object} io
 */
function reconnect({email, room, socket, io}) {
    const socketIO = {socket, io};

    const stopTimerEmitter = new EventEmitter();
    stopTimerEmitter.emit("stopTimer");

    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    const userIndex = userRepository.getUserIndexById(user.id);
    logger.info("[service.room.reconnect]", {user});
    userRepository.setUserSocket(userIndex, socket.id);

    userRepository.setUserStatus(userIndex, "ONLINE");

    logger.info("[service.room.reconnect]", {room: room});
    socket.join(room);

    emitReconnect(user, socketIO);

    broadcastReconnectMessage(user, socketIO);

    emitSetupAdmin(user, socketIO);

    userService.sendRoomUsers(room, socketIO);

    messageService.sendMessageHistoryToUser(room, socketIO);
}

/**
 * @desc remove all clients and destroy room
 * @param {string} room - id of room
 */
function destroyRoom(room) {
    logger.info('[service.room.destroyRoom]', {message: 'performing room cleanup', room});
    messageRepository.deleteMessagesByRoom(room);
    userRepository.deleteAllUsersFromRoom(room);
    roomRepository.deleteRoom(room);
}

/**
 * @desc send welcome message after user connects
 * @param {Object} user
 * @property {string} user.id
 * @property {string} user.email
 * @property {string} user.room
 * @param {Object} socketIO - id of room
 */
function emitWelcome(user, socketIO) {
    const sender = {...getBot(), room: user.room};
    const text = 'Welcome!';
    logger.info("[service.room.emitWelcome]", {id: user.id, email: user.email, room: user.room});
    new MessageEmitter(socketIO).sendMessageToSender(sender, text, getCurrentTime());
}

/**
 * @desc emit reconnect event after user reconnects
 * @param {Object} user
 * @property {string} user.room
 * @param {Object} socketIO - id of room
 */
function emitReconnect(user, socketIO) {
    const sender = {...getBot(), room: user.room};
    const text = 'Welcome Back';
    logger.info("[service.room.emitReconnect.welcomeBack]", {sender, text});
    new MessageEmitter(socketIO).sendMessageToSender(sender, text, getCurrentTime());
    logger.info("service.room.emitReconnect.reconnect", {room: user.room});
    new SocketEmitter(socketIO).emitEventToSender('reconnect', {message: text});
}

/**
 * @desc send "user has joined" notification to all other room members
 * @param {Object} user
 * @property {string} user.id
 * @property {string} user.email
 * @property {string} user.room
 * @param {Object} socketIO - id of room
 */
function broadcastJoinedMessage(user, socketIO) {
    const sender = {...getBot(), room: user.room};
    const text = `${user.username} has joined the chat`;
    logger.info("[service.room.emitJoinedMessage]", {id: user.id, username: user.username, email: user.email, room: user.room});
    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(sender, text, getCurrentTime());
}

/**
 * @desc send "user has reconnected" message to all others in room
 * @param {Object} user
 * @property {string} user.id
 * @property {string} user.email
 * @property {string} user.room
 * @param {Object} socketIO - id of room
 */
function broadcastReconnectMessage(user, socketIO) {
    const sender = {...getBot(), room: user.room};
    const text = `${user.username} has rejoined the chat`;
    logger.info("[service.room.emitReconnectMessage]", {id: user.id, username: user.username, email: user.email, room: user.room});
    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(sender, text, getCurrentTime());
}

/**
 * @desc emit setupAdmin event to client
 * @param {Object} user
 * @param {Object} socketIO - id of room
 */
function emitSetupAdmin(user, socketIO) {
    logger.info("[service.room.emitSetupAdmin]", {user});
    new SocketEmitter(socketIO).emitEventToSender('setupAdmin', user);
}

module.exports = { createRoom, join, reconnect, destroyRoom };