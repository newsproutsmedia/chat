const {validate: validateUUID, v4: uuid} = require('uuid');
const User = require('./user');
const MessageEmitter = require('../emitters/messageEmitter');
const MessageHistory = require('./messageHistory');
const logger = require('../loaders/logger');
let {bot} = require('../loaders/globals');

/**
 * @desc construct a new or existing room for the current user
 * @param {Object} - Object containing username, email, room, socket, io
 */
module.exports = class Room {

    constructor({username, email, room, socket, io}) {
        this.username = username;
        this.email = email;
        this.room = room;
        this.socket = socket;
        this.io = io;
        this.socketIO = {socket, io};
        this.type = User.setUserType('user');

        logger.info("service.room.constructor", {socket: this.socket.id, username: username, email: email, room: room});

        // if room value is not set, create a new room
        if (!room) {
            this.room = this._create();
            this._emitRoomCreated(this.room);
            this.type = User.setUserType('admin');
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
        User.sendRoomUsers(this.room, this.socketIO);
        // send message history to front end
        new MessageHistory().sendMessageHistoryToUser(this.room, this.socketIO);
        // set up admin tools
        if(this.type === 'admin') this._emitSetupAdmin(user);
    }

    _validate(room) {
        let isValidRoomId = validateUUID(room);
        logger.info("service.room.validate", {room:room, isValid:isValidRoomId});
        return validateUUID(room);
    }

    _create() {
        let uniqueRoomId = uuid();
        logger.info("service.room.create", {uniqueRoomId});
        return uniqueRoomId;
    }

    _emitRoomCreated(uniqueRoomId) {
        logger.info("service.room.emitRoomCreated", {uniqueRoomId});
        new MessageEmitter(this.socketIO).emitEventToSender('roomCreated', uniqueRoomId);
    }

    _emitInvalidRoom(room) {
        logger.info("service.room.emitInvalidRoom", {room});
        new MessageEmitter(this.socketIO).emitEventToSender('invalidRoom', room);
    }

    _emitWelcome({id, email, room}) {
        const user = {...bot, room};
        const text = 'Welcome to Chat!';
        logger.info("service.room.emitWelcome", {id, email, room});
        new MessageEmitter(this.socketIO).sendMessageToSender(user, text);
    }

    _emitJoinedMessage({id, username, email, room}) {
        const user = {...bot, room};
        const text = `${username} has joined the chat`;
        logger.info("service.room.emitJoinedMessage", {id, username, email, room});
        new MessageEmitter(this.socketIO).sendMessageToAllOthersInRoom(user, text);
    }

    _emitSetupAdmin(user) {
        logger.info("service.room.emitSetupAdmin", {user});
        new MessageEmitter(this.socketIO).emitEventToSender('setupAdmin', user);
    }
}
