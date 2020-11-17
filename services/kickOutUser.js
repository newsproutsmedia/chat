const User = require('../services/user');

module.exports = class KickOutUser {
    constructor({socket, io, id}) {
        this.socket = socket;
        this.io = io;
        this.kickedOutUserId = id;
    }

    kickOutUser() {
        User.setUserTerminated(this.kickedOutUserId);
        const user = User.getCurrentUser(this.kickedOutUserId);
        User.emitLogoutUser(user, {socket: this.socket, io: this.io});
        this.io.sockets.sockets[this.kickedOutUserId].disconnect();
    }
}