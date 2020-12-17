const User = require('../services/user');
const logger = require('../loaders/logger');

/**
 * @description check if connecting user already exists and has permissions in room
 * @param {Object} socket
 * @param {Object} currentUser
 */
function validateUserOnConnect(socketIO, currentUser) {
    const {socket, io} = socketIO;
    logger.info("security.validation.validateUserOnConnect", {message: "Validating connected user", currentUser});
    return roomIdExists(io, currentUser) && userExistsInRoom(currentUser) && userDisconnected(currentUser);
}

function roomIdExists(io, currentUser) {
    // check if room with that id exists
    if(io.nsps['/'].adapter.rooms[currentUser.room]) {
        logger.info("[security.validation.roomIdExists]", {roomExists: true});
        return true;
    }

    logger.info("[security.validation.roomIdExists]", {roomExists: false});
    return false;
}

function userExistsInRoom(currentUser) {
    // check if user exists in room
    if(User.getUsersByEmailAndRoom(currentUser.room, currentUser.email).length > 0) {
        logger.info("[security.validation.userExistsInRoom]", {userExists: true});
        return true;
    }
    logger.info("[security.validation.userExistsInRoom]", {userExists: false});
    return false;
}

function userDisconnected(currentUser) {
    // if user exists, check that their status is set to "DISCONNECTED"
    const user = User.getCurrentUserByRoomAndEmail(currentUser.room, currentUser.email);
    const userDisconnected = user.status === "DISCONNECTED";
    logger.info("[security.validation.userDisconnected]", {userDisconnected});
    return userDisconnected;
}

module.exports = validateUserOnConnect;