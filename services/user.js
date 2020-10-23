const logger = require('./logger');
const users = [];
const appName = process.env.APP_NAME || "ChatApp";
const bot = { username: appName, type: 'bot' };
const formatMessage = require('../utils/formatting');

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

    static getCurrentUser(id) {
        return users.find(user => user.id === id);
    }


    static incrementUserMessageCount(id) {
        const userIndex = users.findIndex(user => user.id === id);
        users[userIndex].messageCount = users[userIndex].messageCount + 1;
        return {
            userId: id,
            count: users[userIndex].messageCount
        }
    }

    static userLeave({socket, io}) {
        const currentUser = User.getCurrentUser(socket.id);
        logger.info("socket.disconnect: User is leaving", {currentUser});

        const index = users.findIndex(user => user.id === socket.id);

        // return user
        if(users.splice(index, 1)[0]) {
            // notify other chat participants that user has left
            User.emitUserHasLeft(currentUser, io);
            logger.info("socket.disconnect: User left", {currentUser});
            // send updated users and room info
            User.sendRoomUsers({room: currentUser.room, io: io});
        }
    }

    static emitUserHasLeft(user, io) {
        io.in(user.room).emit('message', formatMessage(bot, `${user.username} has left the chat`));
    }

    static getRoomUsers(room) {
        return users.filter(user => user.room === room);
    }


    static sendRoomUsers({room, io}) {
        let roomUsers = {
            room: room,
            users: User.getRoomUsers(room)
        };
        logger.info("service.room.sendRoomUsers", {room, roomUsers});
        io.in(room).emit('roomUsers', roomUsers);
    }

}