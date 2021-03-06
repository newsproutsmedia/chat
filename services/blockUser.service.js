const userRepository = require('../repositories/user.repository');
const userService = require('../services/user.service');
const logger = require('../loaders/logger');

/**
 * @desc eject and block user from room
 * @property {Object} socket
 * @property {Object} io
 * @property {string} id - id of user to be blocked
 */
function blockUser({id, socket, io}) {
    logger.info('[service.blockUser.blockUser]', {message: 'Attempting to block user', socket: socket.id, userID: id});
    const socketIO = {socket, io};
    const user = userRepository.getCurrentUserById(id);
    const message = "userBlocked";
    userRepository.setUserBlocked(user.socket);

    if(io.sockets.sockets[user.socket] === undefined) {
        logger.info('[service.blockUser.blockUser]', {message: 'User socket is undefined. User already disconnected.'});
        return userService.sendRoomUsers(user.room, socketIO);
    }

    logger.info('[service.blockUser.blockUser]', {message: 'User socket found. Emitting logout and disconnect.'});
    userService.emitLogoutUser(user, socketIO, message);
}

/**
 * @desc is the user with passed socket value blocked
 * @param {Object} socket
 * @returns {boolean}
 */
function userIsBlocked(socket) {
    logger.info('[service.blockUser.userIsBlocked]', {message: 'Checking if user is blocked'});
    const user = userRepository.getUserBySocketId(socket.id);
    if(user) return user.status === "BLOCKED";
    return false;
}

/**
 * @desc perform cleanup tasks after blocked user has been forcibly logged out
 * @param {Object} socketIO - requires socket and io objects
 */
function cleanUpAfterBlockedUserDisconnected(socketIO) {
    logger.info('[service.blockUser.blockUser]', {message: 'Cleaning up after blocked user disconnected.'});
    const currentUser = userRepository.getUserBySocketId(socketIO.socket.id);
    userService.emitUserHasLeft(currentUser, socketIO);
    userService.sendRoomUsers(currentUser.room, socketIO);
}

module.exports = {blockUser, userIsBlocked, cleanUpAfterBlockedUserDisconnected}
