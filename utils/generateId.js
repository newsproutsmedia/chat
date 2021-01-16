const {nanoid} = require('nanoid');
const logger = require('../loaders/logger');

function createRoomId() {
    let uniqueRoomId = nanoid();
    logger.info("[utils.roomId.create]", {uniqueRoomId});
    return uniqueRoomId;
}

function createShortId() {
    let shortId = nanoid(10);
    logger.info("[utils.shortId.create]", {shortId});
    return shortId;
}

module.exports = { createRoomId, createShortId };