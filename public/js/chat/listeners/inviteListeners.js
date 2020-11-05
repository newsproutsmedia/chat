import {outputInviteField, sendInvitations} from "../invitations";

const invitationButton = document.getElementById('sendInvitations');
const addMemberButton = document.getElementById('addMember');

export class InviteListeners {

    constructor() {
        this.sendInviteButtonListener();
        this.addMemberButtonListener();
    }

    sendInviteButtonListener() {
        invitationButton.addEventListener('click', sendInvitations);
    }

    addMemberButtonListener() {
        addMemberButton.addEventListener('click', outputInviteField);
    }
}