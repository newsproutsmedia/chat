const logger = require('../loaders/logger');
const Entity = require('./entity');

/**
 * @desc construct a new user
 * @param {Object} - User object containing id, username, email, room, type
 */
module.exports = class User extends Entity {

    constructor({id, username, email, room, type, messageCount = 0, status = "ONLINE"}) {
        super(id);
        this._id = id;
        this._username = username;
        this._email = email;
        this._room = room;
        this._type = type;
        this._messageCount = messageCount;
        this._status = status;
    }


    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get email() {
        return this._email;
    }

    set email(value) {
        this._email = value;
    }

    get room() {
        return this._room;
    }

    set room(value) {
        this._room = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get messageCount() {
        return this._messageCount;
    }

    set messageCount(value) {
        this._messageCount = value;
    }

    get status() {
        return this._status;
    }

    /**
     * @desc set status
     * @param {string} value
     */
    set status(value) {
        this._status = value;
    }
}

