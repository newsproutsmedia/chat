const logger = require('../loaders/logger');
let {appName, bot, userTypes} = require('../loaders/globals');
const formatMessage = require('../utils/formatting');

const users = [];

/**
 * @desc construct a new user
 * @param {id, username, email, room, type} Obj
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
     * @param id string
     * @return Obj
     */
    static getCurrentUser(id) {
        return users.find(user => user.id === id);
    }

    /**
     * @desc increases message count by 1
     * @param id string
     * @return {userId, count} Obj
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
     * @param {socket, io} Obj
     * @emits User.emitUserHasLeft, User.sendRoomUsers
     */
    static userLeave({socket, io}) {
        const currentUser = User.getCurrentUser(socket.id);
        logger.info("socket.disconnect: User is leaving", {currentUser});

        const index = users.findIndex(user => user.id === socket.id);

        // return user
        if (users.splice(index, 1)[0]) {
            // notify other chat participants that user has left
            User.emitUserHasLeft(currentUser, io);
            logger.info("socket.disconnect: User left", {currentUser});
            // send updated users and room info
            User.sendRoomUsers({room: currentUser.room, io: io});
        }
    }

    /**
     * @desc sends "*username* has left the chat" message to all users
     * @param user, io Obj
     * @emits message
     */
    static emitUserHasLeft(user, io) {
        io.in(user.room).emit('message', formatMessage(bot, `${user.username} has left the chat`));
    }

    /**
     * @desc returns array of room user objects
     * @param room string
     * @return array of objects
     */
    static getRoomUsers(room) {
        return users.filter(user => user.room === room);
    }

    /**
     * @desc returns array of room user objects
     * @param room string
     * @emits {room, users} Obj
     */
    static sendRoomUsers({room, io}) {
        let roomUsers = {
            room: room,
            users: User.getRoomUsers(room)
        };
        logger.info("service.room.sendRoomUsers", {room, roomUsers});
        io.in(room).emit('roomUsers', roomUsers);
    }

    /**
     * @desc check if user type exists in global userTypes Set
     * @param type string
     * @return boolean
     */
    static validateUserType(type) {
        return userTypes.has(type);
    }

    /**
     * @desc set user type
     * @param type string
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