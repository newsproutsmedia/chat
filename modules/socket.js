const socketio = require('socket.io');
const mailer = require('../utils/mail');
const formatMessage = require('../utils/messages');
const room = require('../services/room');
const Room = room.Room;
const { validateRoom, createRoom } = require('../services/room');
const { userJoin, getCurrentUser, incrementUserMessageCount, userLeave, getRoomUsers } = require('../utils/users');
const logger = require('../utils/logging');


module.exports = function(server) {
    const io = socketio(server);
    const appName = process.env.APP_NAME || "ChatApp";
    const bot = { username: appName, type: 'bot' };

// Run when client connects
    io.on('connection', socket => {

        // Get username and room when user joins room
        socket.on('joinRoom', currentUser => {
            // Set socket for Room instance
            Room.socket = socket;
            let chatRoom = new Room(currentUser);
        });

        // listen for chatMessage
        socket.on('chatMessage', (msg) => {
            const user = getCurrentUser(socket.id);
            const messageCount = incrementUserMessageCount(user.id);

            // send message to user
            socket.emit('message', formatMessage(user, msg));

            // send message to everyone else
            socket.broadcast.to(user.room).emit('message', formatMessage(user, msg));

            // update message count for everyone
            io.to(user.room).emit('updatedMessageCount', messageCount);
        });

        // listen for email invitations
        socket.on('emailInvite', async invite => {
            logger.info("socket.connection.emailInvite: Attempting to email invite", invite);
            //TODO pass encryption key using invite.key

            await mailer(invite, socket);
        });

        // Runs when client disconnects
        socket.on('disconnect', () => {
            // pass current user's id to leave function and return current user
            const user = userLeave(socket.id);
            logger.info("socket.disconnect: User is leaving", user);
            if(user) {
                // notify other chat participants that user has left
                io.to(user.room).emit('message', formatMessage(bot, `${user.username} has left the chat`));

                logger.info("socket.disconnect: User left", user);
                // Send updated users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });
    });
}
