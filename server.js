const dotenv = require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const logger = require('./utils/logging');
const socketio = require('socket.io');
const mailer = require('./utils/mail');
const formatMessage = require('./utils/messages');
const { validateRoom, createRoom } = require('./utils/rooms');
const { userJoin, getCurrentUser, incrementUserMessageCount, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const PORT = process.env.PORT || 3000;
const server = exports.server = http.createServer(app).listen(PORT, () => {
    logger.info(`Server is running!`, {port: `${PORT}`, mode: `${process.env.NODE_ENV}`});
});
const io = socketio(server);

// use helmet
app.use(helmet());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
const appName = process.env.APP_NAME || "ChatApp";

const bot = { username: appName, type: 'bot' };

// Run when client connects
io.on('connection', socket => {

    // Get username and room when user joins room
    socket.on('joinRoom', currentUser => {
        currentUser.type = 'user';


        // create new room value
        if(!currentUser.room) {
            logger.info("Room is blank, creating a new room");
            currentUser.room = createRoom();
            socket.emit('roomCreated', currentUser.room);
            currentUser.type = 'admin';
            bot.room = currentUser.room;
        }

        // check if roomID is valid
        if(!validateRoom(currentUser.room)) socket.emit('invalidRoom', currentUser.room);
        currentUser.id = socket.id;

        // create user object, get id from socket and pass username and room from URL
        const user = userJoin(currentUser);

        //TODO check whether the room is full, then if user is already logged in, if YES to either -- deny entry

        // actually join the user to the room
        logger.info("socket.connection.joinRoom: Joining User", user);
        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(bot, 'Welcome to Chat!'));

        // Broadcast to everyone (except user) when user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(bot, `${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        // If admin, set up admin tools
        if(user.type === 'admin') socket.emit('setupAdmin', user);
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