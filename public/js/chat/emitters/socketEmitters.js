import {socket} from "../listeners/socketListeners";

// Join chatroom
export function emitJoinRoom(currentUser) {
    socket.emit('joinRoom', currentUser);
}

export function emitIncrementMessageCount(message) {
    socket.emit('increment-message-count', message.user.id);
}

export function emitChatMessage(message) {
    socket.emit('chatMessage', message);
}

export function emitEmailInvite(invite) {
    socket.emit('emailInvite', invite);
}