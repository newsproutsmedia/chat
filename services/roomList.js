let rooms = [];

function addRoom(room) {
    rooms.push(room);
}

/**
 * @desc remove room from rooms array
 * @param {string} room
 */
function deleteRoom(room) {
    rooms.splice(rooms.indexOf(room), 1);
    return rooms;
}

function roomExists(room) {
    return rooms.includes(room);
}

module.exports = { addRoom, deleteRoom, roomExists };