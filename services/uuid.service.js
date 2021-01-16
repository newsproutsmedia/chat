const logger = require('../loaders/logger');
const {v4: uuid} = require('uuid');

function createUUID() {
    let uniqueRoomId = uuid();
    logger.info("[service.room.create]", {uniqueRoomId});
    return uniqueRoomId;
}

module.exports = { createUUID };