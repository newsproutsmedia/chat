const userRepository = require('../repositories/user.repository');
const logger = require('../loaders/logger');
const roomRepository = require('../repositories/room.repository');

/**
 * @description check if currentUser params are valid
 * @param {Object} currentUser - room, email, username
 * @returns {boolean} valid
 */
function validateOnConnect(currentUser) {
    return userStatusIsValid(currentUser) && roomIsValid(currentUser) && roomUserIsValid(currentUser);
}

/**
 * @description check if currentUser's room is valid
 * @param {Object} currentUser - room, email, username
 * @returns {boolean} valid
 */
function roomIsValid(currentUser) {
    const roomSet = !!currentUser.room;
    const roomIdValid = validateRoomId(currentUser.room);
    const roomValidated = roomSet && roomIdValid;
    logger.info("[security.validation.roomIsValid]", {roomSet, roomIdValid, roomValidated});
    return roomValidated;
}

/**
 * @description check if currentUser is valid
 * @param {Object} currentUser - room, email, username
 * @returns {boolean} valid
 */
function roomUserIsValid(currentUser) {
    const roomIdExists = userRoomIdExists(currentUser);
    const userExists = userExistsInRoom(currentUser);
    const nameMatches = usernameMatches(currentUser);
    const userValidated = roomIdExists && userExists && nameMatches;
    logger.info("[security.validation.roomUserIsValid]", {roomIdExists, userExists, nameMatches, userValidated});
    return userValidated;
}

/**
 * @description check if currentUser's staus is valid
 * @param {Object} currentUser - room, email, username
 * @returns {boolean} valid
 */
function userStatusIsValid(currentUser) {
    const userStatusDisconnect = userDisconnected(currentUser);
    const userStatusInvited = userInvited(currentUser);
    const statusValidated = userStatusDisconnect || userStatusInvited;
    logger.info("[security.validation.roomIsValid]", {userStatusDisconnect, userStatusInvited, statusValidated});
    return statusValidated;
}

/**
 * @description validate user is currently disconnected
 * @param {Object} currentUser
 * @returns {boolean} userDisconnected
 */
function validateUserDisconnected(currentUser) {
    logger.info("security.validation.validateUserOnConnect", {message: "Validating connected user", currentUser});
    return userDisconnected(currentUser);
}

/**
 * @description check if connecting user already exists and has permissions in room
 * @param {Object} currentUser
 * @returns {boolean} userDisconnected
 */
function userRoomIdExists(currentUser) {
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
 * @returns {boolean} userExistsInRoom
 */
function userExistsInRoom(currentUser) {
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
 * @returns {boolean} usernameMatches
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
 * @returns {boolean} userIsDisconnected
 */
function userDisconnected({room, email}) {
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    if(user && user.status === "DISCONNECTED") {
        logger.info("[security.validation.userDisconnected]", {userDisconnected: true});
        return true;
    }
    logger.info("[security.validation.userDisconnected]", {userDisconnected: false});
    return false;
}

/**
 * @description check if user is invited
 * @param {Object} currentUser - room and email
 * @returns {boolean} userIsInvited
 */
function userInvited({room, email}) {
    logger.info("[security.validation.userInvited]", {room, email});
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    if(user && user.status === "INVITED") {
        logger.info("[security.validation.userInvited]", {userInvited: true});
        return true
    }
    logger.info("[security.validation.userInvited]", {userInvited: false});
    return false;
}

/**
 * @description check if room id is valid
 * @param {string} roomId
 * @returns {boolean} isValidRoomId
 */
function validateRoomId(roomId) {
    const isValidRoomId = roomRepository.roomExists(roomId);
    logger.info("security.validation.validateRoomId", {room:roomId, isValid:isValidRoomId});
    return isValidRoomId;
}

module.exports = { validateUserDisconnected, validateOnConnect, userDisconnected, userInvited };