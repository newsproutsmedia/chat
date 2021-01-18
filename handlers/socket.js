const {validateOnConnect, validateUserDisconnected} = require("../security/validation");
const socketio = require('socket.io');
const roomService = require('../services/room.service');
const Message = require('../services/message.service');
const Mail = require('../services/mail.service');
const userService = require('../services/user.service');
const {blockUser, userIsBlocked, cleanUpAfterBlockedUserDisconnected} = require('../services/blockUser.service');
const LogoutTimer = require('../services/logoutTimer.service');
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

            logger.info("[socket.connection.event.joinRoom]", {message: "Validating Current User", currentUser});
            if(!validateOnConnect(currentUser)) {
                return new SocketEmitter(socketIO).emitEventToSender('invalidUser', currentUser);
            }

            logger.info("[socket.connection.event.joinRoom]", {message: "Attempting to join room", currentUser});

            if(validateUserDisconnected(currentUser)) {
                logger.info("[socket.connection.event.joinRoom.validateUserOnConnect]", {message: "User invited, attempting to reconnect", currentUser});
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
            blockUser({...socketIO, id});
        });

        // Runs when client is disconnected
        socket.on('disconnect', reason => {
            logger.info("[socket.connection.event.disconnect]", {message: "User disconnected", reason});
            userIsBlocked(socket) ? cleanUpAfterBlockedUserDisconnected(socketIO) : userService.userDisconnected(socketIO, logoutTimer);
        });

        process.on('exit', (code) => {
            logger.info("[socket.connection.event.process.exit]", {message: "NodeJs Shutting Down", code});
            new SocketEmitter(socketIO).emitToAllConnectedClients('systemCrash', 'systemCrash');
        });

    });
}
