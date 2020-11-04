// add chat member onclick event
import {generateShortId} from "./utils/generateShortId";
import {getChildInputIds} from "./utils/getChildInputIds";

let addedUsers = 0;
let invitedUserEmails = [];

export function addChatMember() {
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
};

export function outputInviteSection(user) {
    const inviteSection = document.createElement('invite');
    inviteSection.innerHTML = `<h4>Invite</h4>
                            <div id="recipients"></div>
                <div class="flex-align-middle"><a id="addMember" onclick="addChatMember()"><i class="fas fa-plus-circle fa-lg"></i> Invite Someone</a></div>
                <hr>
                <button id="sendInvitations" class="btn send-invitations-btn" onclick="sendInvitations()">Send Invites</button>
`;
    document.querySelector('#dashMenu').appendChild(inviteSection);
}

// Add pending users to DOM
export function outputInvitedUser({id, email}) {

    let invite = document.getElementById(id).parentNode;
    invite.innerHTML = `<span class="badge badge-success">SENT</span>${email}`;
    invite.className = "user";
    invite.setAttribute("id", email);
}

export function outputInviteDiv(userList) {
    let invited = document.createElement("div");
    invited.id = "invited";
    invited.innerHTML = "<h4>Invite</h4>";
    userList.parentNode.insertBefore(invited, userList.nextSibling); // insert after "users" section
}

export function updateInvitedList(users) {
    if(invitedUserEmails.length === 0) return document.getElementById("invited").remove();
    console.log(users);
    for(let user in users) {
        console.log("user in users:", users[user].email);
        if(invitedUserEmails.includes(users[user].email)) {
            let thisChildId = users[user].email;
            console.log("removing child: ", thisChildId);
            document.getElementById(thisChildId).remove();
            invitedUserEmails = invitedUserEmails.filter(a => a !== users[user].email);
        }
    }

    console.log(invitedUserEmails);
}

export function outputSendFailureMessage(id) {
    let badge = document.getElementById(id);
    errorBadge(badge);
    document.getElementById(id).parentElement.classList.add("send-failure");
    let message = document.createElement('p');
    message.className =  "send-failure-message";
    message.innerHTML = "There was a problem sending this invite. Please check to make sure the email address is valid and try again.";
    document.getElementById(id).parentNode.appendChild(message);
}

export function outputSendErrorMessage(id) {
    document.getElementById(id).parentElement.classList.add("send-failure");
    let message = document.createElement('p');
    message.className =  "send-failure-message";
    message.innerHTML = "An error occurred while sending this invite. Please check to make sure the email address is valid and try again.";
    document.getElementById(id).parentNode.appendChild(message);
}

export function addPendingBadge(element) {
    if(document.getElementById(`${element.id}_badge`)) {
        let existingBadge = document.getElementById(`${element.id}_badge`);
        existingBadge.classList.add("badge-warning");
        existingBadge.classList.remove("badge-danger");
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

export function errorBadge(element) {
    let badge = document.getElementById(`${element.id}_badge`);
    badge.classList.remove("badge-warning");
    badge.classList.add("badge-danger");
    badge.innerHTML = "ERROR";
}

// send invites onclick event
export function sendInvitations() {
    console.log("sendInvitations");
    let newInviteEmails = [];
    let newInviteChildren = getChildInputIds("recipients");
    console.log(newInviteChildren);
    for (let i = 0; i < newInviteChildren.length; i++) {
        let inviteInputId = newInviteChildren[i].id;
        let inviteEmailInput = document.getElementById(inviteInputId);
        addPendingBadge(inviteEmailInput);
        let inviteEmailAddress = inviteEmailInput.value;
        if(inviteEmailAddress !== "") {
            invitedUserEmails.push(inviteEmailAddress);
            newInviteEmails.push({
                id: inviteInputId,
                email: inviteEmailAddress
            });
        }

    }
    // form "invite" object containing an array of "recipients"
    let invite = {
        recipients: newInviteEmails
    }
    console.log(invite);

    // emit "emailInvite" with "invite" object
    // move this to main.js
    // find all other emits out of main.js and refactor into main.js
    // try using event listeners to do so
    socket.emit('emailInvite', invite);
}