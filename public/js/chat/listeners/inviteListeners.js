import {outputInviteField, sendInvitations} from "../invitations.js";

export class InviteListeners {

    constructor() {
        this.invitationButton = document.getElementById('sendInvitations');
        this.addMemberButton = document.getElementById('addMember');
        this.sendInviteButtonListener();
        this.addMemberButtonListener();
    }

    sendInviteButtonListener() {
        this.invitationButton.addEventListener('click', sendInvitations);
    }

    addMemberButtonListener() {
        this.addMemberButton.addEventListener('click', outputInviteField);
    }
}