require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const UncaughtException = require('./handlers/uncaughtException');
const handlebars = require('express-handlebars');

// load route modules
const index = require('./routes/index.routes');
const login = require('./routes/login.routes');
const join = require('./routes/join.routes');

// Initialize App
const app = express();

// use built-in json middleware
// if json found in request body, convert it to json object
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // parse key=value pairs (typically used for form processing)

app.use(cors());

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
}));

// use routes
app.use('/', index);
app.use('/login', login);
app.use('/join', join);

// Logging
const logger = require('./loaders/logger');

// Set up uncaught exception handler
new UncaughtException();

// Serve static resources
app.use(express.static(path.join(__dirname, 'public')));

// Render View
/*app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views/partials');*/


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



