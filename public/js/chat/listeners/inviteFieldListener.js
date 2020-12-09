import {showInviteButton, hideInviteButton} from "../invitations.js";

export class InviteFieldListener {

    constructor(id) {
        this.invitationField = document.getElementById(id);
        console.log(this.invitationField);
        this.inviteFieldHasDataListener();
    }

    inviteFieldHasDataListener() {
        this.invitationField.addEventListener('input', this.toggleInviteButtonVisible);
    }

    toggleInviteButtonVisible(event) {
        event.target.value.length > 0 ? showInviteButton() : hideInviteButton();
    }

}