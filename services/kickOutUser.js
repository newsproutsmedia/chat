const User = require('../services/user');
const logger = require('../loaders/logger');

module.exports = class KickOutUser {
    constructor({socket, io, id}) {
        this.socket = socket;
        this.io = io;
        this.kickedOutUserId = id;
    }

    kickOutUser() {
        User.setUserTerminated(this.kickedOutUserId);
        const user = User.getCurrentUser(this.kickedOutUserId);

        if(this.io.sockets.sockets[this.kickedOutUserId] === undefined) {
            logger.info('[service.kickOutUser.kickOutUser', {message: 'User socket is undefined. User already disconnected.'});
            return User.sendRoomUsers(user.room, {socket: this.socket, io: this.io});
        }

        logger.info('[service.kickoutUser.kickOutUser()', {message: 'User socket found. Emitting logout and disconnect.'});
        User.emitLogoutUser(user, {socket: this.socket, io: this.io});
        this.io.sockets.sockets[this.kickedOutUserId].disconnect();
    }
}