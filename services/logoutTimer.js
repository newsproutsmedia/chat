const logger = require('../loaders/logger');
const RoomService = require('../services/room.service');
const { disconnectTimeout } = require('../loaders/globals');

module.exports = class LogoutTimer {

    constructor() {
        this.timerStatus = false;
    }

    startLogoutTimer(socketIO, room) {
        logger.info('[emitters.timeoutEmitter.stopLogoutTimer]', {message: "Starting Disconnect Timer"});
            this.timer = setTimeout(() => {
                RoomService.destroyRoom(socketIO, room);
            }, disconnectTimeout);
            this.timerStatus = true;
    }

    stopLogoutTimer() {
        logger.info('[emitters.timeoutEmitter.stopLogoutTimer]', {message: "Stopping Disconnect Timer"});
        clearTimeout(this.timer);
        this.timerStatus = false;
    }

}