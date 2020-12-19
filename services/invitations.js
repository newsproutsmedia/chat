let invitations = [];
const logger = require('../loaders/logger');

module.exports = class Invitations {

    /**
     * @description add invitation to queue
     * @param {string} roomId - object containing message user and text
     */
    static addRoomToInvitationList(roomId) {
        logger.info('service.invitations.addRoomToInvitationList', {message: "Adding room to invitation list", roomId});
        invitations.push({id: roomId, count: 1});
        logger.info('service.invitations.addRoomToInvitationList', {message: "Room Added", invitations});

    }

    /**
     * @description add message to queue
     * @param {Object} message - object containing message user and text
     */
    static incrementRoomInvites(roomId) {
        const roomIndex = invitations.findIndex(room => room.id === roomId);
        invitations[roomIndex].count = invitations[roomIndex].count + 1;
        logger.info('service.invitations.incrementRoomInvites', {message: "invite count incremented by 1", count: invitations[roomIndex].count});
    }

    static getInviteCount(roomId) {
        const room = invitations.find(invite => invite.id === roomId);
        logger.info('service.invitations.getInviteCount', {count: room.count});
        return room.count;
    }

    static getRoomInvitations(roomId) {
        const roomInvitations = invitations.filter(room => room.id.includes(roomId));
        logger.info('service.invitations.getInviteCount', {roomInvitationsLength: roomInvitations.length});
        return roomInvitations;
    }

    static deleteRoomFromInvitationList(roomId) {
        logger.info('service.invitations.deleteRoomFromInvitationList', {message: 'deleting room invitations', roomId});
        const newInvitationArray = invitations.filter(invite => {
            return this.getRoomInvitations(roomId).indexOf(invite) === -1;
        });
        invitations = newInvitationArray;
        logger.info('service.invitations.deleteRoomFromInvitationList', {message: 'deleted room invitations', newInvitationList: invitations});
    }

}