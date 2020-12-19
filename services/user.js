const logger = require('../loaders/logger');
let {bot, userTypes} = require('../loaders/globals');
const MessageEmitter = require('../emitters/messageEmitter');
const MessageHistory = require('./messageHistory');
const Invitations = require('./invitations');
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
        this.status = "ONLINE";
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
    static getCurrentUserById(id) {
        return users.find(user => user.id === id);
    }

    /**
     * @desc get information about current user from email
     * @param {string} room
     * @param {string} email
     * @return {Object} user - object containing current user info
     */
    static getCurrentUserByRoomAndEmail(room, email) {
        return users.find(user => user.room === room && user.email === email);
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
     * @desc set user status to DISCONNECTED and notify other users when user leaves chat
     * @param {Object} socketIO - socket and io params
     * @emits User.emitUserHasLeft, User.sendRoomUsers
     */
    static userDisconnected({socket, io}) {
        const socketIO = {socket, io};
        logger.info('[service.user.userDisconnected]', {socketID: socketIO.socket.id});
        if(!User.getCurrentUserById(socket.id)) return;
        const currentUser = User.getCurrentUserById(socket.id);
        logger.info('[service.user.userDisconnected]', {users});
        logger.info('[service.user.userDisconnected]', {message: `User (${currentUser.username}) leaving room`, room: currentUser.room});

        const index = users.findIndex(user => user.id === socket.id);

        // notify other chat participants that user has left
        User.emitUserHasLeft(currentUser, socketIO);

        // set user status to DISCONNECTED
        if(users[index].status !== "BLOCKED") users[index].status = "DISCONNECTED";
        logger.info("[service.user.userDisconnected]", {message: "Status Changed", userStatus: currentUser.status});

        // send updated users and room info
        User.sendRoomUsers(currentUser.room, socketIO);

        // check if current user is the last one in the room and destroy the room if it is
        User.destroyRoomOnLastUserDisconnected(socketIO);
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
        logger.info('[service.user.emitUserHasLeft]', {message: "Sending user has left notice to room", text});
        new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(sysUser, text);
    }

    /**
     * @desc emits logout user event to front-end
     * @param {Object} user - user object
     * @param {Object} socketIO - io and socket params
     * @param {string} message - reason for logout
     */
    static emitLogoutUser(user, socketIO, message) {
        logger.info('[service.user.emitLogoutUser]', {message: "Sending logoutUser event", socketID: user.id, logoutMessage: message});
        new MessageEmitter(socketIO).emitEventToSocket('logoutUser', user.id, {message: message});
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
     * @desc returns index of user by email
     * @param {string } room
     * @param {string } email
     * @return {array}
     */
    static getUsersByEmailAndRoom(room, email) {
        return users.filter(user => user.room === room && user.email === email);
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
        logger.info("[service.room.sendRoomUsers]", {socket: socketIO.socket.id, room, roomUsers});
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
            logger.warn("[service.user.setUserType]", {message: `INVALID USER TYPE: ${type} is not a valid user type`, type});
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
        logger.info('[service.room.destroyRoom]', {message: 'performing room cleanup', room});
        MessageHistory.deleteRoomMessages(room);
        Invitations.deleteRoomFromInvitationList(room);
        User.deleteRoomUsers(room);
    }

    /**
     * @desc remove all users from array
     * @param {string} room - id of room
     */
    static deleteRoomUsers(room) {
        logger.info('[service.user.deleteRoomUsers]', {message: 'deleting room users', room});
        users = users.filter(user => {
            return this.getRoomUsers(room).indexOf(user) === -1;
        });
        logger.info('[service.user.deleteRoomUsers]', {users});
    }

    /**
     * @desc if disconnected user is last in room, destroy the room
     * @param {Object} socketIO - socket and io params
     * @requires {Object} socketIO.socket
     * @requires {Object} socketIO.io
     */
    static destroyRoomOnLastUserDisconnected({socket, io}) {
        logger.info('[service.user.userDisconnected]', {message: 'Checking number of room users'});
        const socketIO = {socket, io};
        const currentUser = User.getCurrentUserById(socket.id);
        const rooms = io.nsps['/'].adapter.rooms[currentUser.room];
        logger.info('[service.user.userDisconnected]', {rooms});
        if(!rooms) {
            User.destroyRoom(socketIO, currentUser.room);
        };
    }

    /**
     * @desc set user status to "BLOCKED"
     * @param {string} id
     */
    static setUserBlocked(id) {
        const index = users.findIndex(user => user.id === id);
        users[index].status = "BLOCKED";
    }

    /**
     * @desc update user id
     * @param {string} id
     */
    static updateUserId(oldSocketId, newSocketId) {
        const index = users.findIndex(user => user.id === oldSocketId);
        users[index].id = newSocketId;
    }

    /**
     * @desc set status of user object
     * @param {string} id
     * @param {string} status
     */
    static setUserStatus(id, status) {
        const index = users.findIndex(user => user.id === id);
        users[index].status = status;
    }

}