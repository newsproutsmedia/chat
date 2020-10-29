
/**
 * @desc construct a new socket emitter
 * @param {Object} socketIO - And object containing socket and io parameters
 * @param {Object} socketIO.socket - The socket object of the current user
 * @param {Object} socketIO.io - The io object of the current user
 */
module.exports = class SocketEmitter {

    constructor(socketIO) {
        this.socket = socketIO.socket;
        this.io = socketIO.io;
    }

    /**
     * @desc emit an event and object back to the current user
     * @param {string} eventType - The type of event to be passed (eg 'message')
     * @param {any} object - The object to be passed with the event
     */
    emitEventToSender(eventType, object) {
        this.socket.emit(eventType, object);
    }

    /**
     * @desc emit an event and object to ALL room users (including sender)
     * @param {string} eventType - The type of event to be passed (eg 'message')
     * @param {string} room - The ID of the room to emit to
     * @param {any} object - The object to be passed with the event
     */
    emitToAllInRoom(eventType, room, object) {
        this.io.in(room).emit(eventType, object);
    }

    /**
     * @desc emit an event and object to room users (EXCEPT sender)
     * @param {string} eventType - The type of event to be passed (eg 'message')
     * @param {string} room - The ID of the room to emit to
     * @param {any} object - The object to be passed with the event
     */
    emitToOthersInRoom(eventType, room, object) {
        this.socket.to(room).emit(eventType, object);
    }

}