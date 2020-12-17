const validateUserOnConnect = require("../security/validation");
const socketio = require('socket.io');
const Room = require('../services/room');
const Message = require('../services/message');
const Mail = require('../services/mail');
const User = require('../services/user');
const BlockUser = require('../services/blockUser');
const logger = require('../loaders/logger');

module.exports = function(server) {
    const io = socketio(server, {
        pingTimeout: 30000
    });

    // Run when client connects
    io.on('connection', socket => {
        const socketIO = {socket, io};
        logger.info("[socket.connection.event.connection]", {message: "Socket connected", socketID: socket.id});
        // Get username and room when user joins room
        socket.on('joinRoom', currentUser => {
            logger.info("[socket.connection.event.joinRoom]", {message: "Attempting to join room", currentUser});

            if(validateUserOnConnect(socketIO, currentUser)) {
                logger.info("[socket.connection.event.joinRoom.validateUserOnConnect]", {message: "User validated, attempting to reconnect", currentUser});
                return new Room({...currentUser, ...socketIO}).reconnect();
            }

            // if room and/or user don't exist
            new Room({...currentUser, ...socketIO}).join();
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
          new BlockUser({...socketIO, id}).blockUser();
        });

        // Runs when client is disconnected
        socket.on('disconnect', reason => {
            logger.info("[socket.connection.event.disconnect]", {message: "User disconnected", reason});
            User.userDisconnected(socketIO);
        });

    });
}
