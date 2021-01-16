const userRepository = require('../repositories/user.repository');
const {getBot} = require('../loaders/globals');
const logger = require('../loaders/logger');
const MessageEmitter = require('../emitters/messageEmitter');
const SocketEmitter = require('../emitters/socketEmitter');
const User = require('../models/user');

function createUser({username, email, room, type}) {
    const user = new User({username: username, email: email, room: room, type: type});
    userRepository.addUser(user);
}

/**
 * @desc set user status to DISCONNECTED and notify other users when user leaves chat
 * @param {Object} socketIO - socket and io params
 * @param {LogoutTimer} logoutTimer
 * @emits User.emitUserHasLeft, User.sendRoomUsers
 */
function userDisconnected({socket, io}, logoutTimer) {
    const socketIO = {socket, io};
    logger.info('[service.user.userDisconnected]', {socketID: socketIO.socket.id});
    if(!userRepository.getCurrentUserById(socket.id)) return;
    const currentUser = userRepository.getCurrentUserById(socket.id);
    logger.info('[service.user.userDisconnected]', {message: `User (${currentUser.username}) leaving room`, room: currentUser.room});

    // notify other chat participants that user has left
    emitUserHasLeft(currentUser, socketIO);

    // set user status to DISCONNECTED
    const index = userRepository.getUserIndexById(socket.id);
    userRepository.setUserStatus(index,"DISCONNECTED");
    logger.info("[service.user.userDisconnected]", {message: "Status Changed", userStatus: currentUser.status});

    // send updated users and room info
    sendRoomUsers(currentUser.room, socketIO);

    // check if current user is the last one in the room and destroy the room if it is
    destroyRoomOnLastUserDisconnected(socketIO, logoutTimer);
}

/**
 * @desc sends "*username* has left the chat" message to all users
 * @param {Object} user - user that left room
 * @requires {string} user.room - room id of user that left
 * @requires {string} user.username - username of user that left
 * @param {Object} socketIO  - object containing socket and io params
 * @requires {Object} socketIO.socket
 * @requires {Object} socketIO.io
 * @emits message
 */
function emitUserHasLeft(user, socketIO) {
    const sysUser = {...getBot(), room: user.room};
    const text = `${user.username} has left the chat`;
    logger.info('[service.user.emitUserHasLeft]', {message: "Sending user has left notice to room", text});
    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(sysUser, text);
}

/**
 * @desc emits logout user event to front-end
 * @param {Object} user - user object
 * @param {Object} socketIO - io and socket params
 * @param {string} message - reason for logout
 */
function emitLogoutUser(user, socketIO, message) {
    logger.info('[service.user.emitLogoutUser]', {message: "Sending logoutUser event", socketID: user.id, logoutMessage: message});
    new MessageEmitter(socketIO).emitEventToSocket('logoutUser', user.id, {message: message});
}

/**
 * @desc returns array of room user objects
 * @param {string} room
 * @param {Object} socketIO
 * @emits object containing room id and array of users in room
 */
function sendRoomUsers(room, socketIO) {
    const roomUsers = {
        room: room,
        users: userRepository.getRoomUsers(room, socketIO)
    };
    logger.info("[service.room.sendRoomUsers]", {socket: socketIO.socket.id, room, roomUsers: roomUsers});
    new SocketEmitter(socketIO).emitToAllInRoom('roomUsers', room, roomUsers);
}

/**
 * @desc if disconnected user is last in room, destroy the room
 * @param {Object} socketIO - socket and io params
 * @param {Object} logoutTimer
 * @requires {Object} socketIO.socket
 * @requires {Object} socketIO.io
 */
function destroyRoomOnLastUserDisconnected(socketIO, logoutTimer) {
    logger.info('[service.user.userDisconnected]', {message: 'Checking number of room users'});
    const {socket, io} = socketIO;
    const currentUser = userRepository.getCurrentUserById(socket.id);
    const rooms = io.nsps['/'].adapter.rooms[currentUser.room];
    logger.info('[service.user.userDisconnected]', {rooms});
    if(!rooms) {
        logoutTimer.start(socketIO, currentUser.room);
    }
}

module.exports = { createUser, userDisconnected, emitLogoutUser, emitUserHasLeft, sendRoomUsers }