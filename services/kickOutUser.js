const User = require('../services/user');

module.exports = class KickOutUser {
    constructor({socket, io, id}) {
        this.socket = socket;
        this.io = io;
        this.socketId = id;
    }

    kickOutUser() {
        User.setUserTerminated(this.socketId);
        this.io.sockets.sockets[this.socketId].disconnect();
    }
}