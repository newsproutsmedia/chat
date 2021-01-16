const logger = require('../loaders/logger');
const MessageHistory = require('./messageHistory');
const Invitations = require('./invitations');
const Room = require('../models/room');
const userService = require('../services/user.service');
const userRepository = require('../repositories/user.repository');
const roomRepository = require('../repositories/room.repository');
const EventEmitter = require('events');
const MessageEmitter = require('../emitters/messageEmitter');
const SocketEmitter = require('../emitters/socketEmitter');
let {getBot} = require('../loaders/globals');

function createRoom() {
    const room = new Room();
    roomRepository.addRoom(room.getId());
    Invitations.addRoomToInvitationList(room.getId());
    return room;
}

function join({email, room, socket, io}) {

    const socketIO = {socket, io};
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    const userIndex = userRepository.getUserIndexById(user.id);
    if(roomIsFull(room)) return emitRoomFull(room);

    logger.info("[service.room.joinRoom]", {room: room});
    socket.join(room);

    // set user.firstConnect to false

    // welcome current user
    emitWelcome(user, socketIO);
    // broadcast to everyone (except user) when user connects
    broadcastJoinedMessage(user, socketIO);
    // set up admin tools
    if(user.type === 'admin') emitSetupAdmin(user);
    userRepository.setUserSocket(userIndex, socket);
    userRepository.setUserStatus(userIndex, "ONLINE");
    // send users and room info to front end
    userService.sendRoomUsers(room, socketIO);
    // send message history to front end
    new MessageHistory().sendMessageHistoryToUser(room, socketIO);

}

function reconnect({email, room, socket, io}) {
    const socketIO = {socket, io};
    // stop disconnect countdown
    const stopTimerEmitter = new EventEmitter();
    stopTimerEmitter.emit("stopTimer");

    // update userID
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    const userIndex = userRepository.getUserIndexById(user.id);
    logger.info("[service.room.reconnect]", {user});
    userRepository.setUserSocket(userIndex, socket.id);

    // update connection status
    userRepository.setUserStatus(userIndex, "ONLINE");

    // rejoin room
    logger.info("[service.room.reconnect]", {room: room});
    socket.join(room);

    // emit reconnect event
    emitReconnect(user, socketIO);

    // broadcast to everyone (except user) when user connects
    broadcastReconnectMessage(user, socketIO);

    // set up admin tools
    if(user.type === 'admin') emitSetupAdmin(user, socketIO);

    // send users and room info to front end
    userService.sendRoomUsers(room, socketIO);

    // send message history to front end
    new MessageHistory().sendMessageHistoryToUser(room, socketIO);
}



function roomIsFull(roomId) {
    const userCount = userRepository.getRoomUsers(roomId);
    const inviteCount = Invitations.getInvitationCount(roomId);
    const newRoomUsersLength = userCount + 1;
    if(newRoomUsersLength > userCount + inviteCount) {
        logger.warn("[service.room.join.roomIsFull]", {message: "Room is full", room: roomId});
        return true;
    }
    return false;
}

/**
 * @desc remove all clients and destroy room
 * @param {Object} socketIO - socket and io params
 * @param {string} room - id of room
 */
function destroyRoom({socket, io}, room) {
    logger.info('[service.room.destroyRoom]', {message: 'performing room cleanup', room});
    MessageHistory.deleteRoomMessages(room);
    userRepository.deleteAllUsersFromRoom(room);
    roomRepository.deleteRoom(room);
}

function emitRoomFull(room, socketIO) {
    const message = {
        message: "roomFull"
    }
    logger.info("[service.room.emitRoomFull]", {message: "Room Full", room});
    new SocketEmitter(socketIO).emitEventToSender('accessDenied', message);
}

function emitWelcome({id, email, room}, socketIO) {
    const user = {...getBot(), room};
    const text = 'Welcome to Chat!';
    logger.info("[service.room.emitWelcome]", {id, email, room});
    new MessageEmitter(socketIO).sendMessageToSender(user, text);
}

function emitReconnect({room}, socketIO) {
    const user = {...getBot(), room};
    const text = 'Welcome Back';
    logger.info("[service.room.emitReconnect.welcomeBack]", {user, text});
    new MessageEmitter(socketIO).sendMessageToSender(user, text);
    logger.info("service.room.emitReconnect.reconnect", {room});
    new SocketEmitter(socketIO).emitEventToSender('reconnect', {message: text});
}

function broadcastJoinedMessage({id, username, email, room}, socketIO) {
    const user = {...getBot(), room};
    const text = `${username} has joined the chat`;
    logger.info("[service.room.emitJoinedMessage]", {id, username, email, room});
    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(user, text);
}

function broadcastReconnectMessage({id, username, email, room}, socketIO) {
    const user = {...getBot(), room};
    const text = `${username} has rejoined the chat`;
    logger.info("[service.room.emitReconnectMessage]", {id, username, email, room});
    new MessageEmitter(socketIO).sendMessageToAllOthersInRoom(user, text);
}

function emitSetupAdmin(user, socketIO) {
    logger.info("[service.room.emitSetupAdmin]", {user});
    new SocketEmitter(socketIO).emitEventToSender('setupAdmin', user);
}

module.exports = { createRoom, join, reconnect, destroyRoom };