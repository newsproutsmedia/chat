const logger = require('../loaders/logger');
const MessageHistory = require('./messageHistory');
const Invitations = require('./invitations');
const UserRepository = require('../repositories/user.repository');
const roomList = require('./roomList');

/**
 * @desc remove all clients and destroy room
 * @param {Object} socketIO - socket and io params
 * @param {string} room - id of room
 */
function destroyRoom({socket, io}, room) {
    logger.info('[service.room.destroyRoom]', {message: 'performing room cleanup', room});
    MessageHistory.deleteRoomMessages(room);
    Invitations.deleteRoomFromInvitationList(room);
    UserRepository.deleteAllUsersFromRoom(room);
    roomList.deleteRoom(room);
}

module.exports = { destroyRoom };