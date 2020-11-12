const logger = require('../loaders/logger');
let {bot, userTypes} = require('../loaders/globals');
const MessageEmitter = require('../emitters/messageEmitter');
const MessageHistory = require('./messageHistory');
let users = [];

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
     * @param {Object} socketIO - socket and io params
     * @emits User.emitUserHasLeft, User.sendRoomUsers
     */
    static userLeave({socket, io}) {
        logger.info('service.user.userLeave', {socket_id: socket.id});
        const socketIO = {socket, io};
        const currentUser = User.getCurrentUser(socket.id);
        logger.info('service.user.userLeave', {room: currentUser.room});

        const index = users.findIndex(user => user.id === socket.id);

        // log out current user
        User.emitLogoutUser(currentUser, socketIO);
        // notify other chat participants that user has left
        User.emitUserHasLeft(currentUser, socketIO);
        // set user status to DISCONNECTED
        users[index].status = "DISCONNECTED";

        logger.info("socket.disconnect: User left", {userStatus: currentUser.status});
        // send updated users and room info
        User.sendRoomUsers(currentUser.room, socketIO);

        User.userDisconnected(socketIO);
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
     * @desc emits logout user event to front-end
     * @param {Object} user - user object
     * @param {Object} socketIO - io and socket params
     */
    static emitLogoutUser(user, socketIO) {
        new MessageEmitter(socketIO).emitEventToSender('logoutUser', {});
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
        logger.info("service.user.setUserType", {type});
        if (!User.validateUserType(type)) {
            logger.warn("service.user.setUserType", {message: `INVALID USER TYPE: ${type} is not a valid user type`, type});
            return 'user';
        }
        return type;
    }

    /**
     * @desc remove all clients and destroy room
     * @param {Object} socketIO - socket and io params
     * @param {string} room - id of room
     */
    static destroyRoom({socket, io}, room) {
        logger.info('service.room.destroyRoom', {message: 'performing room cleanup', room});
        MessageHistory.deleteRoomMessages(room);
        this.deleteRoomUsers(room);
    }

    static deleteRoomUsers(room) {
        logger.info('service.user.deleteRoomUsers', {message: 'deleting room users', room});
        const newUsersArray = users.filter(user => {
            return this.getRoomUsers(room).indexOf(user) === -1;
        });
        users = newUsersArray;
        logger.info('service.user.deleteRoomUsers', {users});
    }

    static userDisconnected({socket, io}) {
        logger.info('service.room.userDisconnected', {message: 'checking number of room users'});
        const socketIO = {socket, io};
        const currentUser = User.getCurrentUser(socket.id);
        const rooms = Object.keys(socket.rooms);
        logger.info('service.room.userDisconnected', {rooms});
        if(!rooms) {
            User.destroyRoom(socketIO, currentUser.room);
        };
    }

}