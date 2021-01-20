require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const UncaughtException = require('./handlers/uncaughtException');
const DataRecovery = require('./handlers/dataRecovery');
const handlebars = require('express-handlebars');

// load route modules
const index = require('./routes/index.routes');
const join = require('./routes/join.routes');
const chat = require('./routes/chat.routes');

// Initialize App
const app = express();

// use built-in json middleware
// if json found in request body, convert it to json object
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse key=value pairs (typically used for form processing)

// use routes
app.use('/', index);
app.use('/join', join);
app.use(['/chat', '/chat.html'], chat);

// Logging
const logger = require('./loaders/logger');

// Set up uncaught exception handler
new UncaughtException();

// Serve static resources
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');
//Sets handlebars configurations (we will go through them later on)
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
//new configuration parameter
    extname: 'hbs',
    defaultLayout: 'index'
}));

require('./loaders/handlebars');

// Server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
if (process.env.NODE_ENV !== "test") {
        server.listen(PORT, () => {
            logger.info(`Server is running!`, {port: `${PORT}`, mode: `${process.env.NODE_ENV}`});
            // Set up handler to manage data recovery
            // in case of unexpected Node shutdown
            new DataRecovery().onStartup();
        });
}

// Globals
require('./loaders/globals');

// Socket
require('./handlers/socket')(server);

// Production Modules
require('./loaders/production')(app);

module.exports = server;



