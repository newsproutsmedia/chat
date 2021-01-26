const {nanoid} = require('nanoid');
const logger = require('../loaders/logger');

/**
 * @desc create a unique long ID for room name
 * @returns {string} uniqueRoomId
 */
function createRoomId() {
    let uniqueRoomId = nanoid();
    logger.info("[utils.generateId.createRoomId]", {uniqueRoomId});
    return uniqueRoomId;
}

/**
 * @desc create a unique short ID for object persistence
 * @returns {string} uniqueRoomId
 */
function createShortId() {
    let shortId = nanoid(10);
    logger.info("[utils.generateId.createShortId]", {shortId});
    return shortId;
}

module.exports = { createRoomId, createShortId };