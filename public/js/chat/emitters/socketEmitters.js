import {socket} from "../listeners/socketListeners";

// Join chatroom
export function emitJoinRoom(currentUser) {
    socket.emit('joinRoom', currentUser);
}

export function emitIncrementMessageCount(message) {
    socket.emit('increment-message-count', message.user.id);
}