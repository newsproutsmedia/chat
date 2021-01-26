const userRepository = require('../repositories/user.repository');
const {getBot} = require('../loaders/globals');
const logger = require('../loaders/logger');
const MessageEmitter = require('../emitters/messageEmitter');
const SocketEmitter = require('../emitters/socketEmitter');
const User = require('../models/user');

/**
 * @desc set user status to DISCONNECTED and notify other users when user leaves chat
 * @typedef {Object} user
 * @property {string} username
 * @property {string} email
 * @property {string} room
 * @property {string} type
 */
function createUser({username, email, room, type}) {
    const user = new User({username: username, email: email, room: room, type: type});
    userRepository.addUser(user);
    return user;
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
    if(!userRepository.getUserBySocketId(socket.id)) return;
    const currentUser = userRepository.getUserBySocketId(socket.id);
    logger.info('[service.user.userDisconnected]', {message: `User (${currentUser.username}) leaving room`, room: currentUser.room});

    emitUserHasLeft(currentUser, socketIO);

    const index = userRepository.getUserIndexById(currentUser.id);
    userRepository.setUserStatus(index,"DISCONNECTED");
    logger.info("[service.user.userDisconnected]", {message: "Status Changed", userStatus: currentUser.status});

    sendRoomUsers(currentUser.room, socketIO);

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
    logger.info('[service.user.emitLogoutUser]', {message: "Sending logoutUser event", socketID: user.socket, logoutMessage: message});
    new SocketEmitter(socketIO).emitEventToSocket('logoutUser', user.socket, {message: message});
}

/**
 * @desc returns array of room user objects
 * @param {string} room
 * @param {Object} socketIO
 * @emits object containing room id and array of users in room
 */
function sendRoomUsers(room, socketIO) {
    const roomUserList = userRepository.getRoomUsers(room);
    const {io} = socketIO;
    roomUserList.forEach(user => {
        const socketId = user.socket;
        const userSocketIO = {socketId, io};
        const roomUsers = {
            room: room,
            users: userRepository.getRoomUsersByUserType(room, socketId)
        };
        logger.info("[service.room.sendRoomUsers]", {roomUsers: roomUsers});
        new SocketEmitter(userSocketIO).emitEventToSocket('roomUsers', socketId, roomUsers);
    })

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
    const currentUser = userRepository.getUserBySocketId(socket.id);
    const rooms = io.nsps['/'].adapter.rooms[currentUser.room];
    logger.info('[service.user.userDisconnected]', {rooms});
    if(!rooms) {
        logoutTimer.start(socketIO, currentUser.room);
    }
}



module.exports = { createUser, userDisconnected, emitLogoutUser, emitUserHasLeft, sendRoomUsers }