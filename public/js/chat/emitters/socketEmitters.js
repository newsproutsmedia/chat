import {socket} from "../listeners/socketListeners";

/**
 * @description emit 'joinRoom' event containing currentUser from login
 * @param {Object} currentUser
 * @requires {string} currentUser.username
 * @requires {string} currentUser.email
 */
export function emitJoinRoom(currentUser) {
    socket.emit('joinRoom', currentUser);
}

/**
 * @description emit 'incrementMessageCount' event containing user id
 * @param {Object} message
 * @requires {string} message.user.id
 */
export function emitIncrementMessageCount(message) {
    socket.emit('incrementMessageCount', message.user.id);
}

/**
 * @description emit 'chatMessage' event containing the message
 * @param {Object} message
 * @requires {string} message.text
 */
export function emitChatMessage(message) {
    socket.emit('chatMessage', message);
}

/**
 * @description emit 'emailInvite' event containing array of email addresses
 * @param {Object} invite
 * @requires {array} recipients
 */
export function emitEmailInvite(invite) {
    socket.emit('emailInvite', invite);
}