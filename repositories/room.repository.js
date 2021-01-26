let {rooms} = require('../data/data');
const logger = require('../loaders/logger');

/**
 * @desc get array of all rooms
 * @param {string} roomId
 * @returns {array}
 */
function addRoom(roomId) {
    rooms.push(roomId);
    return rooms;
}

/**
 * @desc get array of all rooms
 * @returns {array}
 */
function getAllRooms() {
    return rooms;
}

/**
 * @desc remove room from rooms array
 * @param {string} roomId
 * @returns array of rooms
 */
function deleteRoom(roomId) {
    logger.info("[repository.room.deleteRoom]", {message: "deleting room", roomId});
    rooms = rooms.filter(room => !room.includes(roomId));
    logger.info("[repository.room.deleteRoom]", {rooms});
    return rooms;
}

/**
 * @desc check if room exists in room array
 * @param {string} room
 * @returns {boolean}
 */
function roomExists(room) {
    return rooms.includes(room);
}

module.exports = { addRoom, getAllRooms, deleteRoom, roomExists }