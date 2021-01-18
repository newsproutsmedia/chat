const userRepository = require('../repositories/user.repository');
const userService = require('../services/user.service');
const logger = require('../loaders/logger');

function blockUser({socket, io, id}) {
    const socketIO = {socket, io};
    const blockedUserId = id;
    const message = "userBlocked";
    userRepository.setUserBlocked(blockedUserId);
    const user = userRepository.getCurrentUserById(blockedUserId);

    if(this.io.sockets.sockets[blockedUserId] === undefined) {
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
    // check that user exists, in case client was denied access to room and user never created
    if(user) return user.status === "BLOCKED";
    return false;
}

/**
 * @desc perform cleanup tasks after blocked user has been forcibly logged out
 * @param {Object} socketIO - requires socket and io objects
 */
function cleanUpAfterBlockedUserDisconnected(socketIO) {
    logger.info('[service.blockUser.blockUser]', {message: 'Cleaning up after blocked user disconnected.'});
    const {socket: {id}, io} = socketIO;
    const currentUser = userRepository.getUserBySocketId(id);
    userService.emitUserHasLeft(currentUser, socketIO);
    userService.sendRoomUsers(currentUser.room, socketIO);
}

module.exports = {blockUser, userIsBlocked, cleanUpAfterBlockedUserDisconnected}
