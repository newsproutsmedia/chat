const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const serveStatic = require('serve-static');


// set public folder for serving static content
app.use(serveStatic(path.join(__dirname, 'public')));

// serve up index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//log users connecting/disconnecting
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

// log messages on the console
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });
});

// send a message to everyone
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`listening on port ${port}`);
});