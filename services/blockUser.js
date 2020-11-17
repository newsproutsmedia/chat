const User = require('../services/user');
const logger = require('../loaders/logger');

module.exports = class BlockUser {
    constructor({socket, io, id}) {
        this.socket = socket;
        this.io = io;
        this.blockedUserId = id;
    }

    blockUser() {
        User.setUserBlocked(this.blockedUserId);
        const user = User.getCurrentUser(this.blockedUserId);

        if(this.io.sockets.sockets[this.blockedUserId] === undefined) {
            logger.info('[service.blockUser.blockUser()', {message: 'User socket is undefined. User already disconnected.'});
            return User.sendRoomUsers(user.room, {socket: this.socket, io: this.io});
        }

        logger.info('[service.blockUser.blockUser()', {message: 'User socket found. Emitting logout and disconnect.'});
        User.emitLogoutUser(user, {socket: this.socket, io: this.io});
        this.io.sockets.sockets[this.blockedUserId].disconnect();
    }
}