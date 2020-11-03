const logger = require('../loaders/logger');
let {appName, bot, userTypes} = require('../loaders/globals');
const addCurrentTime = require('../utils/time');
const MessageEmitter = require('../emitters/messageEmitter');
const users = [];

/**
 * @desc construct a new user
 * @param {Object} - User object containing id, username, email, room, type
 * @requires {string} id
 * @requires {string} username
 * @requires {string} room
 * @requires {string} type
 */
module.exports = class User {

    constructor({id, username, email, room, type}) {
        this.messageCount = 0;
        this.status = "LOGGED_IN";
        this.user = {
            id: id,
            username: username,
            room: room,
            email: email,
            messageCount: this.messageCount,
            status: this.status,
            type: type
        }
    }

    addUser() {
        users.push(this.user);
        return this.user;
    }

    /**
     * @desc get information about current user from id
     * @param {string} id
     * @return {Object} user - object containing current user info
     */
    static getCurrentUser(id) {
        return users.find(user => user.id === id);
    }

    /**
     * @desc increases message count by 1
     * @param {string} id
     * @return {Object} - Object containing user Id and message count
     */
    static incrementUserMessageCount(id) {
        const userIndex = users.findIndex(user => user.id === id);
        users[userIndex].messageCount = users[userIndex].messageCount + 1;
        return {
            userId: id,
            count: users[userIndex].messageCount
        }
    }

    /**
     * @desc remove user from users array upon disconnect
     * @param {Object} socketIO
     * @emits User.emitUserHasLeft, User.sendRoomUsers
     */
    static userLeave({socket, io}) {
        const socketIO = {socket, io};
        const currentUser = User.getCurrentUser(socket.id);
        logger.info("socket.disconnect: User is leaving", {currentUser});

        const index = users.findIndex(user => user.id === socket.id);

        // return user
        if (users.splice(index, 1)[0]) {
            // notify other chat participants that user has left
            User.emitUserHasLeft(currentUser, socketIO);
            logger.info("socket.disconnect: User left", {currentUser});
            // send updated users and room info
            User.sendRoomUsers(currentUser.room, socketIO);
        }
    }

    /**
     * @desc sends "*username* has left the chat" message to all users
     * @param {Object} user - user that left room
     * @requires {string} user.room - room id of user that left
     * @requires {string} user.username - username of user that left
     * @param {Object} socketIO  - object containing socket and io params
     * @requires {Object} socketIO.socket
     * @requires {Object} socketIO.io
     * @emits message
     */
    static emitUserHasLeft(user, socketIO) {
        const sysUser = {...bot, room: user.room};
        const text = `${user.username} has left the chat`;
        new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(sysUser, text);
    }

    /**
     * @desc returns array of room user objects
     * @param {string} room
     * @return {array} - array of user objects
     */
    static getRoomUsers(room) {
        return users.filter(user => user.room === room);
    }

    /**
     * @desc returns array of room user objects
     * @param {string} room
     * @param {Object} socketIO
     * @emits object containing room id and array of users in room
     */
    static sendRoomUsers(room, socketIO) {
        let roomUsers = {
            room: room,
            users: User.getRoomUsers(room)
        };
        logger.info("service.room.sendRoomUsers", {room, roomUsers});
        new MessageEmitter(socketIO).emitToAllInRoom('roomUsers', room, roomUsers);
    }

    /**
     * @desc check if user type exists in global userTypes Set
     * @param {string} type
     * @return boolean
     */
    static validateUserType(type) {
        return userTypes.has(type);
    }

    /**
     * @desc set user type
     * @param {string} type
     * @return string
     */
    static setUserType(type) {
        logger.info("service.room.setUserType", {type});
        if (!User.validateUserType(type)) {
            logger.error("service.user.setUserType", {message: `INVALID USER TYPE: ${type} is not a valid user type`, type});
            return 'user';
        }
        return type;
    }

}