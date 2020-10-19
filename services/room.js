const {validate: validateUUID, v4: uuid} = require('uuid');
const { userJoin, getRoomUsers } = require('../utils/users');
const formatMessage = require('../utils/messages');
const logger = require('../utils/logging');

const appName = process.env.APP_NAME || "ChatApp";
let bot = { username: appName, type: 'bot' };

module.exports = class Room {
    /**
     * @desc initialize a new or existing room for the current user
     * @param currentUser object -
     */
    constructor({socket, io, username, email, room}) {
        this.type = 'user';
        this.socket = socket;
        this.io = io;
        logger.info("service.room.constructor", {socket: this.socket.id, username: username, email: email, room: room});

        // if room value is not set, create a new room
        if (!room) {
            room = this.create();
            this.emitRoomCreated(room);
            this.type = this.setUserType('admin');
            bot.room = room;
        }

        // check if roomID is valid
        if(!this.validate(room)) this.emitInvalidRoom(room);

        // create user object
        const user = userJoin({id: this.socket.id, username, email, room, type: this.type});

        // join user to room
        this.joinRoom(room);

        // welcome current user
        this.emitWelcome(user);
        // broadcast to everyone (except user) when user connects
        this.emitJoinedMessage(user);
        // send users and room info to front end
        this.sendRoomUsers(room);
        // set up admin tools
        if(this.type === 'admin') this.emitSetupAdmin(user);
    }

    setUserType(type) {
        logger.info("service.room.setUserType", {type});
        return type;
    }

    /**
     * @desc validates that the param value is a valid UUID
     * @param string room - UUID string to be evaluated
     * @returns {*}
     */
    validate(room) {
        let isValidRoomId = validateUUID(room);
        logger.info("service.room.validate", {room:room, isValid:isValidRoomId});
        return validateUUID(room);
    }

    /**
     * @desc creates a unique room identifier
     * @returns {string}
     */
    create() {
        let uniqueRoomId = uuid();
        logger.info("service.room.create", {uniqueRoomId});
        return uniqueRoomId;
    }

    emitRoomCreated(uniqueRoomId) {
        logger.info("service.room.emitRoomCreated", {uniqueRoomId});
        this.socket.emit('roomCreated', uniqueRoomId);
    }

    emitInvalidRoom(room) {
        logger.info("service.room.emitInvalidRoom", {room});
        this.socket.emit('invalidRoom', room);
    }

    joinRoom(room) {
        logger.info("service.room.joinRoom", {room});
        this.socket.join(room);
    }

    emitWelcome({id, email, room}) {
        let user = bot;
        let message = 'Welcome to Chat!';
        logger.info("service.room.emitWelcome", {id, email, room});
        // TODO: Put all socket emits and broadcasts into a separate utility
        this.socket.emit('message', formatMessage(user, message));
    }

    emitJoinedMessage({id, username, email, room}) {
        let user = bot;
        let message = `${username} has joined the chat`;
        logger.info("service.room.emitJoinedMessage", {id, username, email, room});
        this.socket.to(room).emit('message', formatMessage(user, message));
    }

    sendRoomUsers(room) {
        let roomUsers = {
            room: room,
            users: getRoomUsers(room)
        };
        logger.info("service.room.sendRoomUsers", {room, roomUsers});
        this.io.in(room).emit('roomUsers', roomUsers);
    }

    emitSetupAdmin(user) {
        logger.info("service.room.emitSetupAdmin", {user});
        this.socket.emit('setupAdmin', user);
    }
}
