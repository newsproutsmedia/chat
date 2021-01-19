const userRepository = require('../repositories/user.repository');
const logger = require('../loaders/logger');
const roomRepository = require('../repositories/room.repository');

/**
 * @description check if currentUser params are valid
 * @param {Object} currentUser - room, email, username
 */
function validateOnConnect(currentUser) {
    // check if roomID is valid
    return userStatusIsValid(currentUser) && roomIsValid(currentUser) && roomUserIsValid(currentUser);
}

function roomIsValid(currentUser) {
    const roomSet = !!currentUser.room;
    const roomIdValid = validateRoomId(currentUser.room);
    const roomValidated = roomSet && roomIdValid;
    logger.info("[security.validation.roomIsValid]", {roomSet, roomIdValid, roomValidated});
    return roomValidated;
}

function roomUserIsValid(currentUser) {
    const roomIdExists = userRoomIdExists(currentUser);
    const userExists = userExistsInRoom(currentUser);
    const nameMatches = usernameMatches(currentUser);
    const userValidated = roomIdExists && userExists && nameMatches;
    logger.info("[security.validation.roomUserIsValid]", {roomIdExists, userExists, nameMatches, userValidated});
    return userValidated;
}

function userStatusIsValid(currentUser) {
    const userStatusDisconnect = userDisconnected(currentUser);
    const userStatusInvited = userInvited(currentUser);
    const statusValidated = userStatusDisconnect || userStatusInvited;
    logger.info("[security.validation.roomIsValid]", {userStatusDisconnect, userStatusInvited, statusValidated});
    return statusValidated;
}

/**
 * @description check if connecting user already exists and has permissions in room
 * @param {Object} currentUser
 */
function validateUserDisconnected(currentUser) {
    logger.info("security.validation.validateUserOnConnect", {message: "Validating connected user", currentUser});
    return userDisconnected(currentUser);
}

function userRoomIdExists(currentUser) {
    // check if room with that id exists
    if(roomRepository.roomExists(currentUser.room)) {
        logger.info("[security.validation.roomIdExists]", {roomExists: true});
        return true;
    }

    logger.info("[security.validation.roomIdExists]", {roomExists: false});
    return false;
}

/**
 * @description check if user exists in room
 * @param {Object} currentUser - room and email
 */
function userExistsInRoom(currentUser) {
    // check if user exists in room
    if(userRepository.getUsersByEmailAndRoom(currentUser.room, currentUser.email).length > 0) {
        logger.info("[security.validation.userExistsInRoom]", {userExists: true});
        return true;
    }
    logger.info("[security.validation.userExistsInRoom]", {userExists: false});
    return false;
}

/**
 * @description check if username matches existing username
 * @param {Object} currentUser - room and email
 */
function usernameMatches(currentUser) {
    const user = userRepository.getCurrentUserByRoomAndEmail(currentUser.room, currentUser.email);
    if(currentUser.username === user.username) {
        logger.info("[security.validation.usernameMatches]", {usernameMatches: true});
        return true;
    }
    logger.info("[security.validation.usernameMatches]", {usernameIsUnique: false, currentUsername: currentUser.username, userInRoom: user, roomUsername: user.username});
    return false;
}

/**
 * @description check if user is disconnected
 * @param {Object} currentUser - room and email
 */
function userDisconnected({room, email}) {
    // if user exists, check that their status is set to "DISCONNECTED"
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    const userDisconnected = user.status === "DISCONNECTED";
    logger.info("[security.validation.userDisconnected]", {userDisconnected});
    return userDisconnected;
}

/**
 * @description check if user is invited
 * @param {Object} currentUser - room and email
 */
function userInvited({room, email}) {
    logger.info("[security.validation.userInvited]", {room, email});
    // if user exists, check that their status is set to "INVITED"
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    const userInvited = user.status === "INVITED";
    logger.info("[security.validation.userInvited]", {userInvited});
    return userInvited;
}

/**
 * @description check if room id is valid
 * @param {string} roomId
 */
function validateRoomId(roomId) {
    const isValidRoomId = roomRepository.roomExists(roomId);
    logger.info("security.validation.validateRoomId", {room:roomId, isValid:isValidRoomId});
    return isValidRoomId;
}

module.exports = { validateUserDisconnected, validateOnConnect, userDisconnected, userInvited };