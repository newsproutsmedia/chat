const {v4: uuid} = require('uuid');
const User = require('../models/user');
const userService = require('../services/user.service');
const userRepository = require('../repositories/user.repository');
const roomList = require('./roomList');
const MessageEmitter = require('../emitters/messageEmitter');
const SocketEmitter = require('../emitters/socketEmitter');
const MessageHistory = require('./messageHistory');
const Invitations = require('./invitations');
const EventEmitter = require('events');
const logger = require('../loaders/logger');
let {bot} = require('../loaders/globals');


/**
 * @desc construct a new or existing room for the current user
 * @param {Object} - Object containing username, email, room, socket, io
 */
module.exports = class Room {

    constructor({username, email, room, socket, io}) {
        this.username = username;
        this.email = email;
        this.room = room;
        this.socket = socket;
        this.io = io;
        this.socketIO = {socket, io};
        this.type = userRepository.setType('user');

        logger.info("[service.room.constructor]", {socket: this.socket.id, username: username, email: email, room: room});

        // if room value is not set, create a new room
        if (!this.room || !roomList.roomExists(this.room)) {
            this.room = this._create();
            this._emitRoomCreated(this.room);
            Invitations.addRoomToInvitationList(this.room, this.email);
            this.type = userRepository.setType('admin');
        }

    }

    join() {
        if(this._roomIsFull()) return this._emitRoomFull(this.room);

        // create user object
        const user = new User({id: this.socket.id, username: this.username, email: this.email, room: this.room, type: this.type})
        userRepository.addUser(user);

        logger.info("[service.room.joinRoom]", {room: this.room});
        this.socket.join(this.room);

        if(!roomList.roomExists(this.room)) roomList.addRoom(this.room);

        // welcome current user
        this._emitWelcome(user);
        // broadcast to everyone (except user) when user connects
        this._broadcastJoinedMessage(user);
        // set up admin tools
        if(this.type === 'admin') this._emitSetupAdmin(user);

        Invitations.removeEmailFromInvitationList(this.room, this.email);
        // send users and room info to front end
        userService.sendRoomUsers(this.room, this.socketIO);
        // send message history to front end
        new MessageHistory().sendMessageHistoryToUser(this.room, this.socketIO);

    }

    reconnect() {
        // stop disconnect countdown
        const stopTimerEmitter = new EventEmitter();
        stopTimerEmitter.emit("stopTimer");

        // update userID
        const user = userRepository.getCurrentUserByRoomAndEmail(this.room, this.email);
        logger.info("[service.room.reconnect]", {user});
        userRepository.updateUserId(user.id, this.socket.id);

        // update connection status
        userRepository.setUserStatus(userRepository.getUserIndexById(this.socket.id), "ONLINE");

        // rejoin room
        logger.info("[service.room.reconnect]", {room: this.room});
        this.socket.join(this.room);

        // emit reconnect event
        this._emitReconnect(user);

        // broadcast to everyone (except user) when user connects
        this._broadcastReconnectMessage(user);

        // set up admin tools
        if(user.type === 'admin') this._emitSetupAdmin(user);

        // send users and room info to front end
        userService.sendRoomUsers(this.room, this.socketIO);

        // send message history to front end
        new MessageHistory().sendMessageHistoryToUser(this.room, this.socketIO);
    }



    _roomIsFull() {
        const userCount = userRepository.getRoomUsers(this.room);
        const inviteCount = Invitations.getInvitationCount(this.room);
        const newRoomUsersLength = userCount + 1;
        if(newRoomUsersLength > userCount + inviteCount) {
            logger.warn("[service.room.join._roomIsFull]", {message: "Room is full", room: this.room});
            return true;
        }
        return false;
    }

    _create() {
        let uniqueRoomId = uuid();
        logger.info("[service.room.create]", {uniqueRoomId});
        return uniqueRoomId;
    }

    _emitRoomCreated(uniqueRoomId) {
        logger.info("[service.room.emitRoomCreated]", {uniqueRoomId});
        new SocketEmitter(this.socketIO).emitEventToSender('roomCreated', uniqueRoomId);
    }

    _emitRoomFull(room) {
        const message = {
            message: "roomFull"
        }
        logger.info("[service.room.emitRoomFull]", {message: "Room Full", room});
        new SocketEmitter(this.socketIO).emitEventToSender('accessDenied', message);
    }

    _emitWelcome({id, email, room}) {
        const user = {...bot, room};
        const text = 'Welcome to Chat!';
        logger.info("[service.room.emitWelcome]", {id, email, room});
        new MessageEmitter(this.socketIO).sendMessageToSender(user, text);
    }

    _emitReconnect({room}) {
        const user = {...bot, room};
        const text = 'Welcome Back';
        logger.info("[service.room.emitReconnect.welcomeBack]", {user, text});
        new MessageEmitter(this.socketIO).sendMessageToSender(user, text);
        logger.info("service.room.emitReconnect.reconnect", {room});
        new SocketEmitter(this.socketIO).emitEventToSender('reconnect', {message: text});
    }

    _broadcastJoinedMessage({id, username, email, room}) {
        const user = {...bot, room};
        const text = `${username} has joined the chat`;
        logger.info("[service.room.emitJoinedMessage]", {id, username, email, room});
        new MessageEmitter(this.socketIO).sendMessageToAllOthersInRoom(user, text);
    }

    _broadcastReconnectMessage({id, username, email, room}) {
        const user = {...bot, room};
        const text = `${username} has rejoined the chat`;
        logger.info("[service.room.emitReconnectMessage]", {id, username, email, room});
        new MessageEmitter(this.socketIO).sendMessageToAllOthersInRoom(user, text);
    }

    _emitSetupAdmin(user) {
        logger.info("[service.room.emitSetupAdmin]", {user});
        new MessageEmitter(this.socketIO).emitEventToSender('setupAdmin', user);
    }
}
