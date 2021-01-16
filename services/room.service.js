const logger = require('../loaders/logger');
const MessageHistory = require('./messageHistory');
const Invitations = require('./invitations');
const User = require('../models/user');
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

function checkRoom() {

    // if room is set, but not in room list, add it to the room list
    if (!roomRepository.roomExists(this.room)) {
        logger.info("[service.room.checkRoom.roomExists]", {message: "Room does not exist yet, adding it to the list"});
        Invitations.addRoomToInvitationList(this.room, this.email);
        this.type = userRepository.setType('admin');
    }
}

function join({email, room, socket, io}) {

    const socketIO = {socket, io};
    const user = userRepository.getCurrentUserByRoomAndEmail(room, email);
    if(roomIsFull(room)) return emitRoomFull(room);

    logger.info("[service.room.joinRoom]", {room: room});
    socket.join(room);

    // set user.firstConnect to false

    // welcome current user
    emitWelcome(user);
    // broadcast to everyone (except user) when user connects
    broadcastJoinedMessage(user);
    // set up admin tools
    if(user.type === 'admin') emitSetupAdmin(user);

    Invitations.removeEmailFromInvitationList(room, email);
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
    logger.info("[service.room.reconnect]", {user});
    userRepository.updateUserId(user.id, socket.id);

    // update connection status
    userRepository.setUserStatus(userRepository.getUserIndexById(socket.id), "ONLINE");

    // rejoin room
    logger.info("[service.room.reconnect]", {room: room});
    socket.join(room);

    // emit reconnect event
    emitReconnect(user);

    // broadcast to everyone (except user) when user connects
    broadcastReconnectMessage(user);

    // set up admin tools
    if(user.type === 'admin') emitSetupAdmin(user);

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
    Invitations.deleteRoomFromInvitationList(room);
    userRepository.deleteAllUsersFromRoom(room);
    roomRepository.deleteRoom(room);
}

function emitRoomCreated(uniqueRoomId) {
    logger.info("[service.room.emitRoomCreated]", {uniqueRoomId});
    new SocketEmitter(this.socketIO).emitEventToSender('roomCreated', uniqueRoomId);
}

function emitRoomFull(room) {
    const message = {
        message: "roomFull"
    }
    logger.info("[service.room.emitRoomFull]", {message: "Room Full", room});
    new SocketEmitter(this.socketIO).emitEventToSender('accessDenied', message);
}

function emitWelcome({id, email, room}) {
    const user = {...getBot(), room};
    const text = 'Welcome to Chat!';
    logger.info("[service.room.emitWelcome]", {id, email, room});
    new MessageEmitter(this.socketIO).sendMessageToSender(user, text);
}

function emitReconnect({room}) {
    const user = {...getBot(), room};
    const text = 'Welcome Back';
    logger.info("[service.room.emitReconnect.welcomeBack]", {user, text});
    new MessageEmitter(this.socketIO).sendMessageToSender(user, text);
    logger.info("service.room.emitReconnect.reconnect", {room});
    new SocketEmitter(this.socketIO).emitEventToSender('reconnect', {message: text});
}




function broadcastJoinedMessage({id, username, email, room}) {
    const user = {...getBot(), room};
    const text = `${username} has joined the chat`;
    logger.info("[service.room.emitJoinedMessage]", {id, username, email, room});
    new MessageEmitter(this.socketIO).sendMessageToAllOthersInRoom(user, text);
}

function broadcastReconnectMessage({id, username, email, room}) {
    const user = {...getBot(), room};
    const text = `${username} has rejoined the chat`;
    logger.info("[service.room.emitReconnectMessage]", {id, username, email, room});
    new MessageEmitter(this.socketIO).sendMessageToAllOthersInRoom(user, text);
}

function emitSetupAdmin(user) {
    logger.info("[service.room.emitSetupAdmin]", {user});
    new MessageEmitter(this.socketIO).emitEventToSender('setupAdmin', user);
}

module.exports = { checkRoom, join, reconnect, roomIsFull, destroyRoom };