const socketio = require('socket.io');
const Room = require('../services/room');
const Message = require('../services/message');
const Mail = require('../services/mail');
const User = require('../services/user');
const logger = require('../loaders/logger');

module.exports = function(server) {
const io = socketio(server);

// Run when client connects
    io.on('connection', socket => {
        const socketIO = {socket, io};

        // Get username and room when user joins room
        socket.on('joinRoom', currentUser => {
            logger.info("socket.connection.joinRoom: Attempting to join room", {currentUser});
            new Room({...currentUser, ...socketIO}).join();
        });

        // listen for chatMessage
        socket.on('chatMessage', message => {
            logger.info("socket.connection.chatMessage: Attempting to send chat message", {message});
            new Message({...message, ...socketIO}).send();
        });

        // listen for email invitations
        socket.on('emailInvite', async invite => {
            logger.info("socket.connection.emailInvite: Attempting to email invite", {invite});

            let mail = new Mail({...invite, ...socketIO});
            await mail.sendAll();
        });

        // Runs when client disconnects
        socket.on('disconnect', () => {
            logger.info("socket.connection.disconnect: User attempting to disconnect");
            User.userLeave(socketIO);
        });
    });
}
