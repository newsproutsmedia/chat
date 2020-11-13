module.exports = class KickOutUser {
    constructor({socket, io, id}) {
        this.socket = socket;
        this.io = io;
        this.socketId = id;
    }

    kickOutUser() {
        this.io.sockets.sockets[this.socketId].disconnect();
    }
}