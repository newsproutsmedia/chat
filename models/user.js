const logger = require('../loaders/logger');
const Entity = require('./entity');

/**
 * @desc construct a new user
 * @param {Object} - User object containing id, username, email, room, type
 */
module.exports = class User extends Entity {

    constructor({id, username, email, room, type, messageCount = 0, status = "ONLINE", firstConnect = true}) {
        super(id);
        this.username = username;
        this.email = email;
        this.room = room;
        this.type = type;
        this.messageCount = messageCount;
        this.status = status;
        this.firstConnect = firstConnect;
    }

    get _username() {
        return this.username;
    }

    set _username(value) {
        this.username = value;
    }

    get _email() {
        return this.email;
    }

    set _email(value) {
        this.email = value;
    }

    get _room() {
        return this.room;
    }

    set _room(value) {
        this.room = value;
    }

    get _type() {
        return this.type;
    }

    set _type(value) {
        this.type = value;
    }

    get _messageCount() {
        return this.messageCount;
    }

    set _messageCount(value) {
        this.messageCount = value;
    }

    get _status() {
        return this.status;
    }

    /**
     * @desc set status
     * @param {string} value
     */
    set _status(value) {
        this.status = value;
    }
}

