const {validateOnConnect, validateUserDisconnected} = require("../security/validation");
const socketio = require('socket.io');
const roomService = require('../services/room.service');
const messageService = require('../services/message.service');
const Message = require('../models/message');
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

    io.on('connection', socket => {
        const socketIO = {socket, io};
        logger.info("[socket.connection.event.connection]", {message: "Socket connected", socketID: socket.id});

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

            roomService.join({...currentUser, ...socketIO});
        });

        socket.on('chatMessage', message => {
            logger.info("[socket.connection.event.chatMessage]", {message: "Attempting to send chat message", messageText: message.text});
            const chatMessage = new Message({...message, ...socketIO});

            messageService.send({...chatMessage, ...socketIO});
        });

        socket.on('emailInvite', async invite => {
            logger.info("[socket.connection.event.emailInvite]", {message: "Attempting to email invite", invite});

            let mail = new Mail({...invite, ...socketIO});
            await mail.sendAll();
        });

        socket.on('blockUser', id => {
            logger.info("[socket.connection.event.blockUser]", {message: "Block user event for user: ", id});
            blockUser({id, ...socketIO});
        });

        socket.on('disconnect', reason => {
            logger.info("[socket.connection.event.disconnect]", {message: "User disconnected", reason});
            userIsBlocked(socket) ? cleanUpAfterBlockedUserDisconnected(socketIO) : userService.userDisconnected(socketIO, logoutTimer);
        });

    });
}
