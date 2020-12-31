const logger = require('../loaders/logger');
const User = require('./user');
let {disconnectTimeout} = require('../loaders/globals');

let timer;
let timerOn = false;

function startTimer(socketIO, room) {
    logger.info('[service.roomTimer.startTimer]', {message: "Starting Disconnect Timer"});
    if(!timerOn) {
        timerOn = true;
        timer = setTimeout(() => {
            User.destroyRoom(socketIO, room);
        }, disconnectTimeout);
    }
}

function stopTimer() {
    logger.info('[service.roomTimer.stopTimer]', {message: "Stopping Disconnect Timer"});
    clearTimeout(timer);
    timerOn = false;
}

function roomTimerIsOn() {
    return timerOn;
}

module.exports = { startTimer, stopTimer, roomTimerIsOn };