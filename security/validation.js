const {validate: validateUUID} = require('uuid');
const SocketEmitter = require('../emitters/socketEmitter');
const userRepository = require('../repositories/user.repository');
const logger = require('../loaders/logger');
const roomRepository = require('../repositories/room.repository');
const axios = require('axios');

/**
 * @description check if currentUser params are valid
 * @param {Object} currentUser - room, email, username
 */
function validateOnConnect(currentUser) {
    // check if roomID is valid
    if(currentUser.room && !validateRoomId(currentUser.room)) return invalid(currentUser, "Room");
    if(!userRoomIdExists(currentUser) || !userExistsInRoom(currentUser) || !usernameMatches(currentUser)) return invalid(currentUser, "User");
    if(!userDisconnected(currentUser) || !userInvited(currentUser)) return invalid(currentUser, "User Status");
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
    const user = userRepository.getUsersByEmailAndRoom(currentUser.room, currentUser.email);
    if(currentUser.username === user.username) {
        logger.info("[security.validation.usernameMatches]", {message: "Usernames match"});
        return true;
    }
    logger.info("[security.validation.usernameMatches]", {message: "Usernames do NOT match"});
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

function invalid({room, email, username}, message) {
    logger.warn("security.validation.invalid", {message: `${message} is invalid, redirecting to join page`, room, email, username});
    axios
        .post('/join', {
            room: room,
            email: email,
            username: username
        })
        .catch(error => {
            console.error(error);
        })
}

module.exports = { validateUserDisconnected, validateOnConnect, userDisconnected, userInvited };