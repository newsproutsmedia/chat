const logger = require('../loaders/logger');
const Entity = require('../models/entity');
const { createShortId } = require('../utils/generateId');
const userRepository = require('../repositories/user.repository');
const {getCurrentTime} = require('../utils/time');

/**
 * @desc construct a chat message
 * @typedef {Object} message
 * @property {string} text
 * @property {Object} socket
 */
module.exports = class Message extends Entity {

    constructor({text, socket}) {
        super(createShortId());
        this.socket = socket;
        this.text = text;
        this.time = getCurrentTime();
        this.user = userRepository.getUserBySocketId(this.socket.id);
        logger.info("[model.message.constructor]", {user: this.user});
    }

}