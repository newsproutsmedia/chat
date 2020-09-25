const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { validateRoom, createRoom } = require('./utils/rooms');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'FawkesChat';

// Run when client connects
io.on('connection', socket => {

    // Get username and room when user joins room
    socket.on('joinRoom', ({ username, room}) => {

        // create new room value
        if(!room) {
            room = createRoom();
            socket.emit('roomCreated', room);
            console.log(room);
        }

        // check if roomID is valid
        if(!validateRoom(room)) socket.emit('invalidRoom', room);

        // create user object, get id from socket and pass username and room from URL
        const user = userJoin(socket.id, username, room);

        //TODO check whether the room is full, then if user is already logged in, if YES to either -- deny entry

        // actually join the user to the room
        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(botName, `Welcome to ChatCord! Socket ID: ${socket.id}`));

        // Broadcast to everyone (except user) when user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        // send message to you
        socket.emit('message', formatMessage("Me", msg));

        // send message to everyone else
        socket.broadcast.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {

        // pass current user's id to leave function and return current user
        const user = userLeave(socket.id);
        if(user) {
            // notify other chat participants that user has left
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

            // Send updatd users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));