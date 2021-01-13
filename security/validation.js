const {validate: validateUUID} = require('uuid');
const MessageEmitter = require('../emitters/messageEmitter');
const User = require('../models/user');
const logger = require('../loaders/logger');
const roomList = require('../services/roomList');

/**
 * @description check if room value is valid UUID
 * @param {Object} currentUser
 */
function validateRoomIdOnConnect(socketIO, currentUser) {
    // check if roomID is valid
    if(currentUser.room && !validateRoomId(currentUser.room)) return roomInvalid(socketIO, currentUser.room);
}

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
    if(io.nsps['/'].adapter.rooms[currentUser.room] || roomList.roomExists(currentUser.room)) {
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

function validateRoomId(room) {
    const isValidRoomId = validateUUID(room);
    logger.info("service.room.validate", {room:room, isValid:isValidRoomId});
    return isValidRoomId;
}

function roomInvalid(socketIO, room) {
    logger.warn("service.room.join.validateRoomId", {message: "Room ID is invalid, disconnecting socket", room: this.room});
    emitInvalidRoom(socketIO, room);
}

function emitInvalidRoom(socketIO, room) {
    logger.info("service.room.emitInvalidRoom", {room});
    new MessageEmitter(socketIO).emitEventToSender('invalidRoom', room);
}

module.exports = { validateUserOnConnect, validateRoomIdOnConnect, validateRoomId };