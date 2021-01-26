const logger = require('../loaders/logger');
const roomService = require('../services/room.service');
const { getDisconnectTimeout } = require('../loaders/globals');

/**
 * @desc disconnect timer
 * @param {boolean} timerStatus - timer is currently running
 */
module.exports = class LogoutTimer {

    constructor(timerStatus) {
        this.timerStatus = timerStatus;
    }

    /**
     * @desc start disconnect timer
     * @param {Object} socketIO
     * @param {string} room
     */
    start(socketIO, room) {
        if(this.getTimerStatus()) return;
        logger.info('[emitters.timeoutEmitter.startLogoutTimer]', {message: "Starting Disconnect Timer"});
        this.timer = setTimeout(() => {
                roomService.destroyRoom(room);
            }, getDisconnectTimeout());
        this.timerStatus = true;
    }

    /**
     * @desc stop disconnect timer
     */
    stop() {
        if(!this.getTimerStatus()) return;
        logger.info('[emitters.timeoutEmitter.stopLogoutTimer]', {message: "Stopping Disconnect Timer"});
        clearTimeout(this.timer);
        this.timerStatus = false;
    }

    /**
     * @desc is timer running?
     * @returns {boolean} timerStatus
     */
    getTimerStatus() {
        return this.timerStatus;
    }

}