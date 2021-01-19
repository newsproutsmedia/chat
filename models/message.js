const logger = require('../loaders/logger');
const Entity = require('../models/entity');
const { createShortId } = require('../utils/generateId');
const userRepository = require('../repositories/user.repository');

/**
 * @desc construct a chat message
 * @param {Object} message, socket, io
 */
module.exports = class Message extends Entity {

    constructor({text, socket}) {
        super(createShortId());
        this.socket = socket;
        this.text = text;
        this.user = userRepository.getUserBySocketId(this.socket.id);
        logger.info("[model.message.constructor]", {user: this.user});
    }

}