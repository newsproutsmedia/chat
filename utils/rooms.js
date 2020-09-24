const {validate: validateUUID, v4: uuid} = require('uuid');

function validateRoom(room) {
    return validateUUID(room);
}

function createRoom() {
    return uuid();
}

module.exports = { validateRoom, createRoom };