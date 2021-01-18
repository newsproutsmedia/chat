import {generateShortId} from "./utils/generateShortId.js";
import {getChildInputIds} from "./utils/getChildInputIds.js";
import {emitEmailInvite} from "./emitters/socketEmitters.js";
import {InviteListeners} from "./listeners/inviteListeners.js";
import {InviteFieldListener} from "./listeners/inviteFieldListener.js";
import {removeElementById} from "./utils/elements.js";
import {emailInRoomUsers} from "./users.js";
import {emailIsValid} from "./utils/validation.js";

let addedUsers = 0;
let newInviteEmails = [];
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
    let inviteInputId = `${randId}`;
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

export function removeInviteField(id) {
    const inviteField = document.getElementById("inviteWrapper_" + id);
    document.getElementById("inviteWrapper_" + id).parentNode.removeChild(inviteField);
}

/**
 * @description add invite section to DOM
 */
export function setupInviteSection() {
    if(document.getElementsByTagName('invite').length > 0) return;
    const inviteSection = document.createElement('invite');
    inviteSection.id = "invite";
    inviteSection.className = "dash-section";
    inviteSection.innerHTML = `<div class="flex-row align-center spread mb-2"><h4>Invite</h4><a id="addMember"><i class="fas fa-plus-circle fa-lg"></i></a></div>
                            <div id="recipients"></div>
                <button id="sendInvitations" class="btn dash-btn h-hidden">Send Invites</button>`;
    document.querySelector('#dashMenu').appendChild(inviteSection);
    new InviteListeners();
}

/**
 * @description output successfully invited user to DOM
 * @param {Element} inviteListElement
 * @param {string} email
 */
export function outputInvitedUser(inviteListElement, email) {
    if(!email) return;
    const invite = document.createElement('div');
    invite.innerHTML = `<span class="badge badge-success">SENT</span>${email}`;
    invite.className = "user";
    invite.setAttribute("id", email);
    inviteListElement.appendChild(invite);
    if(allInvitationsProcessed()) setInviteButtonStateAfterSend(allInvitesSuccessful);
}

export function outputAllInvitedUsers(inviteListElement, users) {
    // OUTPUT users with "INVITED" status
    console.log("outputAllInvitedUsers: ", users);
    if(inviteListElement) inviteListElement.innerHTML = '';
    if(!users) return;
    const invites = users.filter(user => user.status === "INVITED")
    if(invites.length) {
        invites.emails.forEach(email => {
            console.log("outputting invited user: ", email.email);
            outputInvitedUser(inviteListElement, email.email);
        });
    }
}

/**
 * @description empty invited user list
 */
export function clearInvitedList() {
    document.getElementById('invitedList').innerHTML = '';
}

/**
 * @description output email send failure message to DOM
 * @param {string} elementId
 */
export function outputSendFailureMessage(elementId) {
    let badge = document.getElementById(elementId);
    outputErrorBadge(badge);
    let message = document.createElement('p');
    message.id = `${elementId}_ErrorMsg`;
    message.className =  "send-failure-message";
    message.innerHTML = "There was a problem sending this invite. Please check to make sure the email address is valid and try again.";
    const inputParent = document.getElementById(elementId).parentElement;
    inputParent.parentNode.insertBefore(message, inputParent.nextSibling);
    allInvitesSuccessful = false;
}

/**
 * @description output email send error message to DOM
 * @param {string} elementId
 */
export function outputSendErrorMessage(elementId) {
    let message = document.createElement('p');
    message.id = `${elementId}_ErrorMsg`;
    message.className =  "send-failure-message";
    message.innerHTML = "An error occurred while sending this invite. Please check to make sure the email address is valid and try again.";
    const inputParent = document.getElementById(elementId).parentElement;
    console.log(inputParent);
    inputParent.parentNode.insertBefore(message, inputParent.nextSibling);
    allInvitesSuccessful = false;
}

/**
 * @description output redundant email error message to DOM
 * @param {string} elementId
 */
export function outputRedundantEmailMessage(elementId) {
    let message = document.createElement('p');
    message.id = `${elementId}_ErrorMsg`;
    message.className =  "send-failure-message";
    message.innerHTML = "You've already invited a chat member with this email address. Please enter a new address and try again.";
    const inputParent = document.getElementById(elementId).parentElement;
    console.log(inputParent);
    inputParent.parentNode.insertBefore(message, inputParent.nextSibling);
    allInvitesSuccessful = false;
}

/**
 * @description output invalid email error message to DOM
 * @param {string} elementId
 */
export function outputInvalidEmailMessage(elementId) {
    let message = document.createElement('p');
    message.id = `${elementId}_ErrorMsg`;
    message.className =  "send-failure-message";
    message.innerHTML = "Email address is invalid. Needs to be in _@_._ format.";
    const inputParent = document.getElementById(elementId).parentElement;
    console.log(inputParent);
    inputParent.parentNode.insertBefore(message, inputParent.nextSibling);
    allInvitesSuccessful = false;
}

/**
 * @description add "PENDING" badge to invited user list item on send of invites
 * @param {Element} element
 */
export function outputPendingBadge(element) {
    if(document.getElementById(`${element.id}_badge`)) {
        let existingBadge = document.getElementById(`${element.id}_badge`);
        existingBadge.classList.add("badge-warning");
        existingBadge.classList.remove("badge-danger");
        removeElementById(`${element.id}_ErrorMsg`);
        existingBadge.innerHTML = "PENDING";
        return;
    }
    let badge = document.createElement("span");
    badge.id = element.id + "_badge";
    badge.classList.add("badge");
    badge.classList.add("badge-warning");
    badge.innerHTML = "PENDING";
    element.parentNode.prepend(badge);
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
    allInvitesSuccessful = true;
    newInviteEmails = [];
    let newInviteChildren = getChildInputIds("recipients");
    console.log(newInviteChildren);
    for (let i = 0; i < newInviteChildren.length; i++) {
        let inviteInputId = newInviteChildren[i].id;
        let inviteEmailInput = document.getElementById(inviteInputId);
        outputPendingBadge(inviteEmailInput);

        // VALIDATION
        if(!emailIsValid(inviteEmailInput.value)) {
            console.log('email invalid');
            invalidEmailFound(inviteInputId);
            continue;
        }

        if(emailIsDuplicate(inviteEmailInput.value)) {
            console.log('duplicate email found');
            duplicateEmailFound(inviteInputId);
            continue;
        }

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
    if(allInvitesSuccessful) document.getElementById('sendInvitations').setAttribute('disabled', "");
    emitEmailInvite(invite);
}

export function setInviteButtonStateAfterSend(success) {
    console.log('Setting invite button state after send');
    success ? hideInviteButton() : showInviteButton();
    invitationsToProcess = 0;
    allInvitesSuccessful = true;
}

export function showInviteButton() {
    document.getElementById('sendInvitations').removeAttribute('disabled');
    document.getElementById('sendInvitations').classList.remove('h-hidden');
}

export function hideInviteButton() {
    // check that all invite inputs have length of < 5 && button isn't already hidden
    let inviteButton = document.getElementById('sendInvitations');
    if(!inviteButton.classList.contains('h-hidden') && !checkInputLengths('recipients')) {
        document.getElementById('sendInvitations').setAttribute('disabled', "");
        document.getElementById('sendInvitations').classList.add('h-hidden');
    }
}

function allInvitationsProcessed() {
    invitationsToProcess--;
    return invitationsToProcess === 0;
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

function emailIsDuplicate(email) {
    return emailIsOnNewInvitesList(email) || emailIsOnInvitesList(email) || emailInRoomUsers(email);
}

function emailIsOnNewInvitesList(email) {
    const emailInNewList = newInviteEmails.includes(email);
    console.log(`Email (${email} found in new invites list: ${emailInNewList}`);
    return emailInNewList;
}

function emailIsOnInvitesList(email) {
    const emailInList = invitedUserEmails.includes(email);
    console.log(`Email (${email} found in invites list: ${emailInList}`);
    return emailInList;
}

function duplicateEmailFound(inviteInputId) {
    const inviteEmailInput = document.getElementById(inviteInputId);
    outputErrorBadge(inviteEmailInput);
    outputRedundantEmailMessage(inviteInputId);
}

function invalidEmailFound(inviteInputId) {
    const inviteEmailInput = document.getElementById(inviteInputId);
    outputErrorBadge(inviteEmailInput);
    outputInvalidEmailMessage(inviteInputId);
}

