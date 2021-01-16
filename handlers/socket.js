const {validateUserOnConnect, validateRoomIdOnConnect} = require("../security/validation");
const socketio = require('socket.io');
const Room = require('../models/room');
const roomService = require('../services/room.service');
const Message = require('../services/message');
const Mail = require('../services/mail');
const userService = require('../services/user.service');
const BlockUser = require('../services/blockUser');
const LogoutTimer = require('../services/logoutTimer');
const SocketEmitter = require('../emitters/socketEmitter');
const logger = require('../loaders/logger');

module.exports = function(server) {
    const io = socketio(server, {
        pingTimeout: 30000
    });
    const logoutTimer = new LogoutTimer(false);
    // Run when client connects
    io.on('connection', socket => {
        const socketIO = {socket, io};
        logger.info("[socket.connection.event.connection]", {message: "Socket connected", socketID: socket.id});
        // Get username and room when user joins room
        socket.on('joinRoom', currentUser => {

            logger.info("[socket.connection.event.joinRoom]", {message: "Validating Room Id", currentUser});
            validateRoomIdOnConnect(socketIO, currentUser);

            logger.info("[socket.connection.event.joinRoom]", {message: "Attempting to join room", currentUser});

            if(validateUserOnConnect(socketIO, currentUser)) {
                logger.info("[socket.connection.event.joinRoom.validateUserOnConnect]", {message: "User validated, attempting to reconnect", currentUser});
                logoutTimer.stop();
                return roomService.reconnect({...currentUser, ...socketIO});
            }

            // if room and/or user don't exist
            roomService.join({...currentUser, ...socketIO});
        });

        // listen for chatMessage
        socket.on('chatMessage', message => {
            logger.info("[socket.connection.event.chatMessage]", {message: "Attempting to send chat message", messageText: message.text});
            new Message({...message, ...socketIO}).send();
        });

        // listen for email invitations
        socket.on('emailInvite', async invite => {
            logger.info("[socket.connection.event.emailInvite]", {message: "Attempting to email invite", invite});

            let mail = new Mail({...invite, ...socketIO});
            await mail.sendAll();
        });

        // listen for block user event
        socket.on('blockUser', id => {
            logger.info("[socket.connection.event.blockUser]", {message: "Block user event for user: ", id});
            new BlockUser({...socketIO, id}).blockUser();
        });

        // Runs when client is disconnected
        socket.on('disconnect', reason => {
            logger.info("[socket.connection.event.disconnect]", {message: "User disconnected", reason});
            BlockUser.userIsBlocked(socket) ? BlockUser.cleanUpAfterBlockedUserDisconnected(socketIO) : userService.userDisconnected(socketIO, logoutTimer);
        });

        process.on('exit', (code) => {
            logger.info("[socket.connection.event.process.exit]", {message: "NodeJs Shutting Down", code});
            new SocketEmitter(socketIO).emitToAllConnectedClients('systemCrash', 'systemCrash');
        });

    });
}
