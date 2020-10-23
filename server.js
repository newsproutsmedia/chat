const dotenv = require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');


// Initialize App
const app = express();

// Logging
const logger = require('./services/logger');

// Server
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 3000;
const server = exports.server = http.createServer(app).listen(PORT, () => {
    logger.info(`Server is running!`, {port: `${PORT}`, mode: `${process.env.NODE_ENV}`});
});

// Globals
require('./config/globals');

// Socket
require('./loader/socket')(server);

// Production Modules
require('./loader/production')(app);



