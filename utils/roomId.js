const {v4: uuid} = require('uuid');
const logger = require('../loaders/logger');

function createRoomId() {
    let uniqueRoomId = uuid();
    logger.info("[service.room.create]", {uniqueRoomId});
    return uniqueRoomId;
}

module.exports = { createRoomId };