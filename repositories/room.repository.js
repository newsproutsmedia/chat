let rooms = require('../data/rooms.data');

function addRoom(roomId) {
    rooms.push(roomId);
}

function getAllRooms() {
    return rooms;
}

/**
 * @desc remove room from rooms array
 * @param {string} room
 */
function deleteRoom(roomId) {
    rooms = rooms.filter(room => !room === roomId);
}

function roomExists(room) {
    return rooms.includes(room);
}

module.exports = { addRoom, getAllRooms, deleteRoom, roomExists }