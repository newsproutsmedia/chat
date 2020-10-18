const {validate: validateUUID, v4: uuid} = require('uuid');
const { userJoin, getCurrentUser, incrementUserMessageCount, userLeave, getRoomUsers } = require('../utils/users');
const formatMessage = require('../utils/messages');
const logger = require('../utils/logging');

const appName = process.env.APP_NAME || "ChatApp";
let bot = { username: appName, type: 'bot' };

module.exports = class Room {
    /**
     * @desc initialize a new or existing room for the current user
     * @param currentUser object -
     */
    constructor({username, email, room}) {
        let type = 'user';
        logger.info("service.room.initialize", {username, email, room});

        // if room value is not set, create a new room
        if (!room) {
            room = this.create();
            this.emitRoomCreated(room);
            type = this.setUserType('admin');
            bot.room = room;
        }

        // check if roomID is valid
        if(!this.validate(room)) this.emitInvalidRoom(room);

        // create user object
        const user = userJoin({id: this.socket.id, username, email, room, type});

        // join user to room
        this.joinRoom(room);

        // welcome current user
        this.emitWelcome(user);
        // broadcast to everyone (except user) when user connects
        this.broadcastJoined(user);
        // send users and room info to front end
        this.sendRoomUsers(room);
        // set up admin tools
        if(type === 'admin') this.emitSetupAdmin(user);
    }

    static setUserType(type) {
        logger.info("service.room.setUserType", type);
        return type;
    }

    /**
     * @desc validates that the param value is a valid UUID
     * @param string room - UUID string to be evaluated
     * @returns {*}
     */
    static validate(room) {
        let isValidRoomId = validateUUID(room);
        logger.info("service.room.validate", {room:room, isValid:isValidRoomId});
        return validateUUID(room);
    }

    /**
     * @desc creates a unique room identifier
     * @returns {string}
     */
    static create() {
        let uniqueRoomId = uuid();
        logger.info("service.room.create", uniqueRoomId);
        return uniqueRoomId;
    }

    static emitRoomCreated(uniqueRoomId) {
        logger.info("service.room.emitRoomCreated", uniqueRoomId);
        this.socket.emit('roomCreated', uniqueRoomId);
    }

    static emitInvalidRoom(room) {
        logger.info("service.room.emitInvalidRoom", room);
        this.socket.emit('invalidRoom', room);
    }

    static joinRoom(room) {
        logger.info("service.room.joinRoom", room);
        this.socket.join(room);
    }

    static emitWelcome({id, email, room}) {
        let user = bot;
        let message = 'Welcome to Chat!';
        logger.info("service.room.emitWelcome", {id, email, room});
        // TODO: Put all socket emits and broadcasts into a separate utility
        this.socket.emit('message', formatMessage(user, message));
    }

    static broadcastJoined({id, username, email, room}) {
        let user = bot;
        let message = `${username} has joined the chat`;
        logger.info("service.room.broadcastJoined", {id, username, email, room});
        this.socket.broadcast.to(room).emit('message', formatMessage(user, message));
    }

    static sendRoomUsers({room}) {
        let roomUsers = {
            room: room,
            users: getRoomUsers(room)
        };
        logger.info("service.room.sendRoomUsers", {room, roomUsers});
        this.io.to(room).emit('roomUsers', roomUsers);
    }

    static emitSetupAdmin(user) {
        logger.info("service.room.emitSetupAdmin", user);
        this.socket.emit('setupAdmin', user);
    }
}
