import {generateShortId} from "./utils/generateShortId";
import {getChildInputIds} from "./utils/getChildInputIds";
import {emitEmailInvite} from "./emitters/socketEmitters";

let addedUsers = 0;
let invitedUserEmails = [];

/**
 * @description listener callback - add a new invitation field to DOM
 */
export function outputInviteField() {
    console.log("Add Chat Member Clicked");
    let recipient = document.createElement('div');
    let randId = generateShortId();
    recipient.id = "inviteWrapper_" + randId;
    recipient.className = "inviteWrapper";
    recipient.innerHTML = `
        <input 
        type="email" 
        id="inviteInput_${randId}"
        name="inviteInput_${randId}"
        class="emailField"
        placeholder="Enter email address"
        >`;
    document.querySelector('#recipients').appendChild(recipient);

    // set focus to this field
    document.getElementById(`inviteInput_${randId}`).focus();

    addedUsers = addedUsers + 1;
}

/**
 * @description add invite section to DOM
 */
export function outputInviteSection() {
    const inviteSection = document.createElement('invite');
    inviteSection.innerHTML = `<h4>Invite</h4>
                            <div id="recipients"></div>
                <div class="flex-align-middle"><a id="addMember"><i class="fas fa-plus-circle fa-lg"></i> Invite Someone</a></div>
                <hr>
                <button id="sendInvitations" class="btn send-invitations-btn">Send Invites</button>
`;
    document.querySelector('#dashMenu').appendChild(inviteSection);
}

/**
 * @description email successfully sent for invited user
 * @param {string} id
 * @param {string} email
 */
export function outputInvitedUser({id, email}) {

    let invite = document.getElementById(id).parentNode;
    invite.innerHTML = `<span class="badge badge-success">SENT</span>${email}`;
    invite.className = "user";
    invite.setAttribute("id", email);
}

/**
 * @description remove users who have logged in from invited user list
 * @param {Object} users
 */
export function updateInvitedList(users) {

        for (let user in users) {
            if (invitedUserEmails.includes(users[user].email)) {
                console.log("user in users:", users[user].email);
                let thisChildId = users[user].email;
                console.log("removing child: ", thisChildId);
                document.getElementById(thisChildId).remove();
                invitedUserEmails = invitedUserEmails.filter(a => a !== users[user].email);
            }
        }

    if(invitedUserEmails.length === 0) document.getElementById("invited").remove();
    console.log(invitedUserEmails);
}

/**
 * @description output email send failure message to DOM
 * @param {string} elementId
 */
export function outputSendFailureMessage(elementId) {
    let badge = document.getElementById(elementId);
    outputErrorBadge(badge);
    document.getElementById(elementId).parentElement.classList.add("send-failure");
    let message = document.createElement('p');
    message.className =  "send-failure-message";
    message.innerHTML = "There was a problem sending this invite. Please check to make sure the email address is valid and try again.";
    document.getElementById(elementId).parentNode.appendChild(message);
}

/**
 * @description output email send error message to DOM
 * @param {string} elementId
 */
export function outputSendErrorMessage(elementId) {
    document.getElementById(elementId).parentElement.classList.add("send-failure");
    let message = document.createElement('p');
    message.className =  "send-failure-message";
    message.innerHTML = "An error occurred while sending this invite. Please check to make sure the email address is valid and try again.";
    document.getElementById(elementId).parentNode.appendChild(message);
}

/**
 * @description add "PENDING" badge to invited user list item on send of invites
 * @param {Element} elementId
 */
export function outputPendingBadge(elementId) {
    if(document.getElementById(`${elementId.id}_badge`)) {
        let existingBadge = document.getElementById(`${elementId.id}_badge`);
        existingBadge.classList.add("badge-warning");
        existingBadge.classList.remove("badge-danger");
        existingBadge.innerHTML = "PENDING";
        return;
    }
    let badge = document.createElement("span");
    badge.id = elementId.id + "_badge";
    badge.classList.add("badge");
    badge.classList.add("badge-warning");
    badge.innerHTML = "PENDING";
    elementId.parentNode.prepend(badge);
}

/**
 * @description add "ERROR" badge to invited user list item on error
 * @param {Element} elementId
 */
export function outputErrorBadge(elementId) {
    let badge = document.getElementById(`${elementId.id}_badge`);
    badge.classList.remove("badge-warning");
    badge.classList.add("badge-danger");
    badge.innerHTML = "ERROR";
}

/**
 * @description event callback for sendInvites submit button listener
 */
export function sendInvitations() {
    console.log("sendInvitations");
    let newInviteEmails = [];
    let newInviteChildren = getChildInputIds("recipients");
    console.log(newInviteChildren);
    for (let i = 0; i < newInviteChildren.length; i++) {
        let inviteInputId = newInviteChildren[i].id;
        let inviteEmailInput = document.getElementById(inviteInputId);
        outputPendingBadge(inviteEmailInput);
        let inviteEmailAddress = inviteEmailInput.value;
        if(inviteEmailAddress !== "") {
            invitedUserEmails.push(inviteEmailAddress);
            newInviteEmails.push({
                id: inviteInputId,
                email: inviteEmailAddress
            });
        }

    }

    let invite = {
        recipients: newInviteEmails
    }
    console.log(invite);

    emitEmailInvite(invite);
}