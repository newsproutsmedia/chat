import {generateShortId} from "./utils/generateShortId.js";
import {getChildInputIds} from "./utils/getChildInputIds.js";
import {emitEmailInvite} from "./emitters/socketEmitters.js";
import {InviteListeners} from "./listeners/inviteListeners.js";
import {InviteFieldListener} from "./listeners/inviteFieldListener.js";

let addedUsers = 0;
let invitedUserEmails = [];
let invitationsToProcess = 0;
let allInvitesSuccessful = true;

/**
 * @description listener callback - add a new invitation field to DOM
 */
export function outputInviteField() {
    console.log("Add Chat Member Clicked");
    let recipient = document.createElement('div');
    let randId = generateShortId();
    let inviteInputId = `inviteInput_${randId}`;
    recipient.id = "inviteWrapper_" + randId;
    recipient.className = "inviteWrapper";
    recipient.innerHTML = `
        <input 
        type="email" 
        id=${inviteInputId}
        name=${inviteInputId}
        class="emailField"
        placeholder="Enter email address"
        >`;
    document.querySelector('#recipients').appendChild(recipient);

    // set focus to this field
    document.getElementById(inviteInputId).focus();

    // add event listener to this field
    new InviteFieldListener(inviteInputId);

    addedUsers = addedUsers + 1;
}

/**
 * @description add invite section to DOM
 */
export function outputInviteSection() {
    const inviteSection = document.createElement('invite');
    inviteSection.className = "dash-section";
    inviteSection.innerHTML = `<div class="flex-row align-center spread mb-2"><h4>Invite</h4><a id="addMember"><i class="fas fa-plus-circle fa-lg"></i></a></div>
                            <div id="recipients"></div>
                <button id="sendInvitations" class="btn send-invitations-btn h-hidden">Send Invites</button>`;
    document.querySelector('#dashMenu').appendChild(inviteSection);
    new InviteListeners();
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
    if(allInvitationsProcessed()) setInviteButtonStateAfterSend(allInvitesSuccessful);
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

    //if(invitedUserEmails.length === 0) document.getElementById("invited").remove();
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
    allInvitesSuccessful = false;
    if(allInvitationsProcessed()) setInviteButtonStateAfterSend(allInvitesSuccessful);
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
    allInvitesSuccessful = false;
    if(allInvitationsProcessed()) setInviteButtonStateAfterSend(allInvitesSuccessful);
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
    invitationsToProcess = newInviteEmails.length;
    console.log(invite);
    document.getElementById('sendInvitations').setAttribute('disabled', "");
    emitEmailInvite(invite);
}

export function setInviteButtonStateAfterSend(success) {
    document.getElementById('sendInvitations').removeAttribute('disabled');
    success ? hideInviteButton() : showInviteButton();
    invitationsToProcess = 0;
    allInvitesSuccessful = true;
}

export function showInviteButton() {
    document.getElementById('sendInvitations').classList.remove('h-hidden');
}

export function hideInviteButton() {
    // check that all invite inputs have length of < 5 && button isn't already hidden
    let inviteButton = document.getElementById('sendInvitations');
    if(!inviteButton.classList.contains('h-hidden') && !checkInputLengths('recipients')) {
        document.getElementById('sendInvitations').classList.add('h-hidden');
    }
}

function checkInputLengths(parentId) {
    let newInviteChildren = getChildInputIds(parentId);
    if(newInviteChildren.length === 0) return false;
    let inviteValues = [];
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    console.log(newInviteChildren);
    for (let i = 0; i < newInviteChildren.length; i++) {
        let inviteInput = document.getElementById(newInviteChildren[i].id);
        inviteValues.push(inviteInput.value.length);
    }
    return inviteValues.reduce(reducer) > 0;
}

function allInvitationsProcessed() {
    invitationsToProcess--;
    return invitationsToProcess === 0;
}