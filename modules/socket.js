const socketio = require('socket.io');
const Room = require('../services/room');
const Message = require('../services/message');
const Mail = require('../services/mail');
const User = require('../services/user');
const logger = require('../services/logger');


module.exports = function(server) {
    const io = socketio(server);
    const appName = process.env.APP_NAME || "ChatApp";
    const bot = { username: appName, type: 'bot' };

// Run when client connects
    io.on('connection', socket => {

        // Get username and room when user joins room
        socket.on('joinRoom', currentUser => {
            // set socket params for currentUser object
            currentUser.socket = socket;
            currentUser.io = io;

            new Room(currentUser);
        });

        // listen for chatMessage
        socket.on('chatMessage', message => {
            // set socket params for message object
            message.socket = socket;
            message.io = io;

            new Message(message).sendMessage();
        });

        // listen for email invitations
        socket.on('emailInvite', async invite => {
            logger.info("socket.connection.emailInvite: Attempting to email invite", {invite});
            invite.socket = socket;
            invite.io = io;
            let mail = new Mail(invite);
            await mail.sendAll();
        });

        // Runs when client disconnects
        socket.on('disconnect', () => {
            User.userLeave({socket, io});
        });
    });
}
