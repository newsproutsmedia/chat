const {validate: validateUUID, v4: uuid} = require('uuid');
const User = require('./user');
const Message = require('./message');
const logger = require('./logger');
const formatMessage = require('../utils/formatting');
let {bot} = require('../loaders/globals');

/**
 * @desc construct a new or existing room for the current user
 * @param {username, email, room, socket, io} Obj
 */
module.exports = class Room {

    constructor({username, email, room, socket, io}) {
        this.username = username;
        this.email = email;
        this.room = room;
        this.socket = socket;
        this.io = io;
        this.type = this._setUserType('user');

        logger.info("service.room.constructor", {socket: this.socket.id, username: username, email: email, room: room});

        // if room value is not set, create a new room
        if (!room) {
            this.room = this._create();
            this._emitRoomCreated(this.room);
            this.type = this._setUserType('admin');
        }

    }

    join() {
        // check if roomID is valid
        if(!this._validate(this.room)) return this._emitInvalidRoom(this.room);

        // create user object
        const user = new User({id: this.socket.id, username: this.username, email: this.email, room: this.room, type: this.type}).addUser();

        logger.info("service.room.joinRoom", {room: this.room});
        this.socket.join(this.room);

        // welcome current user
        this._emitWelcome(user);
        // broadcast to everyone (except user) when user connects
        this._emitJoinedMessage(user);
        // send users and room info to front end
        User.sendRoomUsers({room: this.room, io: this.io});
        // set up admin tools
        if(this.type === 'admin') this._emitSetupAdmin(user);
    }

    _setUserType(type) {
        logger.info("service.room.setUserType", {type});
        return type;
    }

    /**
     * @desc validates that the param value is a valid UUID
     * @param {string} room - UUID string to be evaluated
     * @returns {*}
     */
    _validate(room) {
        let isValidRoomId = validateUUID(room);
        logger.info("service.room.validate", {room:room, isValid:isValidRoomId});
        return validateUUID(room);
    }

    /**
     * @desc creates a unique room identifier
     * @returns {string}
     */
    _create() {
        let uniqueRoomId = uuid();
        logger.info("service.room.create", {uniqueRoomId});
        return uniqueRoomId;
    }

    _emitRoomCreated(uniqueRoomId) {
        logger.info("service.room.emitRoomCreated", {uniqueRoomId});
        this.socket.emit('roomCreated', uniqueRoomId);
    }

    _emitInvalidRoom(room) {
        logger.info("service.room.emitInvalidRoom", {room});
        this.socket.emit('invalidRoom', room);
    }

    _emitWelcome({id, email, room}) {
        let user = bot;
        let message = 'Welcome to Chat!';
        logger.info("service.room.emitWelcome", {id, email, room});
        // TODO: Put all socket emits and broadcasts into a separate utility
        this.socket.emit('message', formatMessage(user, message));
    }

    _emitJoinedMessage({id, username, email, room}) {
        let user = bot;
        let message = `${username} has joined the chat`;
        logger.info("service.room.emitJoinedMessage", {id, username, email, room});
        this.socket.to(room).emit('message', formatMessage(user, message));
    }

    _emitSetupAdmin(user) {
        logger.info("service.room.emitSetupAdmin", {user});
        this.socket.emit('setupAdmin', user);
    }
}
