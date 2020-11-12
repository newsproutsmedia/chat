const dotenv = require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const UncaughtException = require('./handlers/uncaughtException');

// Initialize App
const app = express();

// Logging
const logger = require('./loaders/logger');

// Set up uncaught exception handler
new UncaughtException();

// Server
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 3000;
const server = http.createServer(app).listen(PORT, () => {
    logger.info(`Server is running!`, {port: `${PORT}`, mode: `${process.env.NODE_ENV}`});
});

// Globals
require('./loaders/globals');

// Socket
require('./handlers/socket')(server);

// Production Modules
require('./loaders/production')(app);

module.exports = server;



