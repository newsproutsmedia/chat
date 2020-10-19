const socketio = require('socket.io');
const mailer = require('../utils/mail');
const formatMessage = require('../utils/messages');
const Room = require('../services/room');
const Message = require('../services/message');
const { userLeave, getRoomUsers } = require('../utils/users');
const logger = require('../utils/logging');


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

            new Message(message);
        });

        // listen for email invitations
        socket.on('emailInvite', async invite => {
            logger.info("socket.connection.emailInvite: Attempting to email invite", {invite});
            //TODO pass encryption key using invite.key

            await mailer(invite, socket);
        });

        // Runs when client disconnects
        socket.on('disconnect', () => {
            // pass current user's id to leave function and return current user
            const user = userLeave(socket.id);
            logger.info("socket.disconnect: User is leaving", {user});
            if(user) {
                // notify other chat participants that user has left
                io.to(user.room).emit('message', formatMessage(bot, `${user.username} has left the chat`));

                logger.info("socket.disconnect: User left", {user});
                // Send updated users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });
    });
}
