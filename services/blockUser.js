const User = require('../services/user');
const logger = require('../loaders/logger');

module.exports = class BlockUser {
    constructor({socket, io, id}) {
        this.socket = socket;
        this.io = io;
        this.socketIO = {socket, io};
        this.blockedUserId = id;
    }

    blockUser() {
        const message = "userBlocked";
        User.setUserBlocked(this.blockedUserId);
        const user = User.getCurrentUserById(this.blockedUserId);

        if(this.io.sockets.sockets[this.blockedUserId] === undefined) {
            logger.info('[service.blockUser.blockUser]', {message: 'User socket is undefined. User already disconnected.'});
            return User.sendRoomUsers(user.room, this.socketIO);
        }

        logger.info('[service.blockUser.blockUser]', {message: 'User socket found. Emitting logout and disconnect.'});
        User.emitLogoutUser(user, this.socketIO, message);
    }

    /**
     * @desc is the user with passed socket value blocked
     * @param {Object} socket
     * @returns {boolean}
     */
    static userIsBlocked(socket) {
        logger.info('[service.blockUser.userIsBlocked]', {message: 'Checking if user is blocked'});
        const user = User.getCurrentUserById(socket.id);
        // check that user exists, in case client was denied access to room and user never created
        if(user) return user.status === "BLOCKED";
        return false;
    }

    /**
     * @desc perform cleanup tasks after blocked user has been forcibly logged out
     * @param {Object} socketIO - requires socket and io objects
     */
    static cleanUpAfterBlockedUserDisconnected(socketIO) {
        logger.info('[service.blockUser.blockUser]', {message: 'Cleaning up after blocked user disconnected.'});
        const {socket: {id}, io} = socketIO;
        const currentUser = User.getCurrentUserById(id);
        User.emitUserHasLeft(currentUser, socketIO);
        User.sendRoomUsers(currentUser.room, socketIO);
    }
}