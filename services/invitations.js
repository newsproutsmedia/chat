let invitations = [];
const logger = require('../loaders/logger');

module.exports = class Invitations {

    /**
     * @description add invitation to queue
     * @param {string} roomId - object containing message user and text
     */
    static addRoomToInvitationList(roomId) {
        logger.info('[service.invitations.addRoomToInvitationList]', {message: "Adding room to invitation list", roomId});
        invitations.push({id: roomId, emails: []});
        logger.info('[service.invitations.addRoomToInvitationList]', {message: "Room Added", invitations});
        return invitations;
    }

    /**
     * @desc get number of outstanding invites for a specific room
     * @param {string} roomId
     * @returns {number}
     */
    static getInvitationCount(roomId) {
        const roomIndex = Invitations.getRoomIndex(roomId);
        logger.info('[service.invitations.getInvitationCount]', {count: invitations[roomIndex].emails.length});
        return invitations[roomIndex].emails.length;
    }

    /**
     * @desc get all outstanding invitations in a specific room
     * @param {string} roomId
     * @returns {*[]}
     */
    static getRoomInvitations(roomId) {
        const roomInvitations = invitations.filter(room => room.id === roomId);
        logger.info('[service.invitations.getRoomInvitations]', {roomInvitations: roomInvitations});
        return roomInvitations;
    }

    static addEmailToInvitationList(roomId, email) {
        const roomIndex = Invitations.getRoomIndex(roomId);
        invitations[roomIndex].emails.push({email: email});
        logger.info('[service.invitations.addEmailToInvitationList]', {invitations: invitations});
        return invitations;
    }

    /**
     * @desc remove email address from invitations array in a specific room and return updated invitations array
     * @param {string} roomId
     * @param {string} emailToRemove
     * @returns {*[]}
     */
    static removeEmailFromInvitationList(roomId, emailToRemove) {
        const roomIndex = Invitations.getRoomIndex(roomId);
        const emailIndex = invitations[roomIndex].emails.map(email => email.email).indexOf(emailToRemove);
        invitations[roomIndex].emails.splice(emailIndex, 1);
        logger.info('[service.invitations.removeEmailFromInvitationList]', {removedEmail: emailToRemove, updatedInvitationList: invitations});
        return invitations;
    }

    /**
     * @desc delete room from invitations array - used during session cleanup after room is destroyed
     * @param {string} roomId
     * @returns {*[]}
     */
    static deleteRoomFromInvitationList(roomId) {
        logger.info('[service.invitations.deleteRoomFromInvitationList]', {message: 'deleting room invitations', roomId});
        invitations = invitations.filter(invite => {
            return this.getRoomInvitations(roomId).indexOf(invite) === -1;
        });
        logger.info('[service.invitations.deleteRoomFromInvitationList]', {message: 'deleted room invitations', newInvitationList: invitations});
        return invitations;
    }

    /**
     * @desc returns index of passed room
     * @param {string} roomId
     * @returns {number}
     */
    static getRoomIndex(roomId) {
        return invitations.findIndex(invite => invite.id === roomId);
    }

}