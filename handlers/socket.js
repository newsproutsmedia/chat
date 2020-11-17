const socketio = require('socket.io');
const Room = require('../services/room');
const Message = require('../services/message');
const Mail = require('../services/mail');
const User = require('../services/user');
const KickOutUser = require('../services/kickOutUser');
const logger = require('../loaders/logger');

module.exports = function(server) {
    const io = socketio(server, {
        pintTimeout: 10000
    });

    // Run when client connects
    io.on('connection', socket => {
        const socketIO = {socket, io};

        // Get username and room when user joins room
        socket.on('joinRoom', currentUser => {
            logger.info("[socket.connection.event.joinRoom]", {message: "Attempting to join room", currentUser});
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

        // listen for kick out
        socket.on('kickOutUser', id => {
          new KickOutUser({...socketIO, id}).kickOutUser();
        });

        // Runs when client is disconnected
        socket.on('disconnect', () => {
            logger.info("[socket.connection.event.disconnect]", {message: "User disconnected"});
            User.userLeave(socketIO);
        });

    });
}
