const logger = require('../loaders/logger');
const Entity = require('./entity');
const { createRoomId } = require('../utils/generateId');


/**
 * @desc construct a new or existing room
 * @param {Object}
 */
module.exports = class Room extends Entity {

    constructor() {
        super(createRoomId());
        logger.info("[service.room.constructor]", {message: "Creating new room"});
    }

}
