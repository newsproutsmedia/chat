const logger = require('../loaders/logger');
const Entity = require('./entity');
const { createShortId } = require('../utils/generateId');

/**
 * @desc construct a new user
 * @typedef {Object} user
 * @property {string} username
 * @property {string} email
 * @property {string} room
 * @property {string} type
 */
module.exports = class User extends Entity {

    constructor({username, email, room, type, messageCount = 0, status = "INVITED"}) {
        super(createShortId());
        this.username = username;
        this.email = email;
        this.room = room;
        this.type = type;
        this.messageCount = messageCount;
        this.status = status;
    }
}

