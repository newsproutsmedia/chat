const logger = require('../loaders/logger');
const roomService = require('../services/room.service');
const { getDisconnectTimeout } = require('../loaders/globals');

module.exports = class LogoutTimer {

    constructor(timerStatus) {
        this.timerStatus = timerStatus;
    }

    start(socketIO, room) {
        if(this.getTimerStatus()) return;
        logger.info('[emitters.timeoutEmitter.startLogoutTimer]', {message: "Starting Disconnect Timer"});
        this.timer = setTimeout(() => {
                roomService.destroyRoom(socketIO, room);
            }, getDisconnectTimeout());
        this.timerStatus = true;
    }

    stop() {
        if(!this.getTimerStatus()) return;
        logger.info('[emitters.timeoutEmitter.stopLogoutTimer]', {message: "Stopping Disconnect Timer"});
        clearTimeout(this.timer);
        this.timerStatus = false;
    }

    getTimerStatus() {
        return this.timerStatus;
    }

}