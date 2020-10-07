const messageInput = document.getElementById('msg');
const showDash = document.getElementById('show-dash');
const hideDash = document.getElementById('hide-dash');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const roomName = document.getElementById('room-name');
const initHeight = window.innerHeight;

const messageBtnId = 'messageSubmitBtn';
const messageBtnIconId = 'messageBtnIcon';
const messageBtnDefault = {id: messageBtnId, style: 'btn-default', icon: {id: messageBtnIconId, style: 'default-message-btn-icon'}};
const messageBtnSend = {id: messageBtnId, style: 'btn-send', icon: {id: messageBtnIconId, style: 'send-message-btn-icon'}};
const messageBtnOk = {id: messageBtnId, style: 'btn-ok', icon: {id: messageBtnIconId, style: 'ok-message-btn-icon'}};

// Get username and room from URL
let { username, email, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true // ignores non key/value data
});

const socket = io();
let maxUsers = 1;
let addedUsers = 0;
let emailAddresses = [];
let currentUser = {
    username,
    email,
    room
}

socket.on('invalidRoom', room => {
    window.location.replace("/index.html");
});

// Join chatroom
socket.emit('joinRoom', currentUser);

// listen for roomCreated, set new room value
socket.on('roomCreated', room => {
    this.room = room;
    let thisURL = window.location.href;
    window.history.replaceState(null, null, `${thisURL}&room=${room}`);
    console.log(window.location.href + '&room=' + room);
});

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
    if(emailAddresses.length !== 0) updateInvitedList(users);
});

// catch 'message' emitted in server.js
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scrolls down automatically
    //TODO instead of scrolling automatically, bring up a clickable arrow at bottom of message window that says "New Messages"
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('updatedMessageCount', messageCount => {
    console.log('updatedMessageCount:', messageCount);
    updateMessageCount(messageCount);
});

socket.on('setupAdmin', user => {
    // add "invite" section to DOM
    const inviteSection = document.createElement('invite');
    inviteSection.innerHTML = `<h4>Invite To Join</h4>
                            <div id="recipients"></div>
                <div class="flex-align-middle"><a id="addMember" onclick="addChatMember()"><i class="fas fa-plus-circle fa-lg"></i> Add Email Input</a></div>
                <hr>
                <button id="sendInvitations" class="btn send-invitations-btn" onclick="sendInvitations()">Send Invites</button>
`;
    document.querySelector('#dashMenu').appendChild(inviteSection);
});

// Mail events
socket.on('inviteNotAllowed', () => {
    console.log("inviteNotAllowed");
    // remove invite section
    // display message saying that user must be the chat admin to invite members
});

socket.on('inviteSendSuccess', () => {
    console.log("inviteSendSuccess");
    // remove invite fields
    clearElements("recipients");
    // if admin, show invited users, greyed out (or with "not joined" badge), in users section
    outputInvitedUsers(emailAddresses);
    // adjust users list
    maxUsers = maxUsers + addedUsers;
    addedUsers = 0;
});

socket.on('inviteSendFailure', () => {
    console.log("inviteSendFailure");
    // display "there was a problem" message
    // tell admin to wait a minute and try again
});

function clearElements(id) {
    const myNode = document.getElementById(id);
    myNode.innerHTML = '';
}


// send invites onclick event
function sendInvitations() {
    console.log("sendInvitations");

    // forEach input item (use addedUsers for iteration) get the value and add to an array
    for (let i = 1; i <= addedUsers; i++) {
        let address = document.getElementById(`invite${i}`).value;
        emailAddresses.push(address);
    }
    // form "invite" object containing an array of "recipients"
    let invite = {
        recipients: emailAddresses
    }
    console.log(invite);

    // emit "emailInvite" with "invite" object
    socket.emit('emailInvite', invite);
}


// add chat member onclick event
function addChatMember() {
    console.log("Add Chat Member Clicked");
    addedUsers = addedUsers + 1;
    let recipient = document.createElement('input');
    recipient.type = "email";
    recipient.id = `invite${addedUsers}`;
    recipient.name = `invite${addedUsers}`;
    recipient.class = "emailField";
    recipient.placeholder = "Enter email address";
    document.querySelector('#recipients').appendChild(recipient);

    // set focus to this field
    document.getElementById(`invite${addedUsers}`).focus();

    // add typing listener
};

// recipient email field typing listener
/// when typing stops, perform email validation
/// if email is valid, activate "Send Invitations" button

// Dashboard Events
showDash.addEventListener('click', function () {
    console.log('showing dash...');
    document.getElementById('dashboard').style.display = 'block';
});

// Hide Dashboard
hideDash.addEventListener('click', function () {
    console.log('hiding dash...');
    document.getElementById('dashboard').style.display = 'none';
});

// add message to list
function addMessage() {

    // get message from "chat-form"
    // form has an id of "msg", so we're getting the value of that input
    let msg = document.getElementById('msg').innerHTML;

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    document.getElementById('msg').innerHTML = '';
    document.getElementById('msg').style.content = 'Enter Message';
    // Set focus to message input
    // document.getElementById('msg').focus();

    // Scroll to top of page
    window.scrollTo(0, 0);
    // disable button
    setButtonState(messageBtnId, messageBtnDefault, [messageBtnSend, messageBtnOk], true);

    // update user message count


}

messageInput.addEventListener('blur', () => {
    window.scrollTo(0, 0);
    if(document.getElementById('msg').innerHTML != "") {
        return setButtonState(messageBtnId, messageBtnSend,[messageBtnDefault, messageBtnOk], false);
        // setSendButtonDisabled(false);
        // return activeSendButton();
    }
    setButtonState(messageBtnId, messageBtnDefault,[messageBtnSend, messageBtnOk], true);
});

messageInput.addEventListener('focus', () => {
    setTimeout(() => {
        setButtonState(messageBtnId, messageBtnOk,[messageBtnDefault, messageBtnSend], false);
        // activeOkButton();
        // setSendButtonDisabled(false);
        let diffHeight = initHeight - window.innerHeight;
        document.getElementById('msg').style.content = diffHeight.toString();
        window.scrollTo(0, diffHeight);
    }, 200);
});

function addButtonState(state) {
    // add button style
        document.getElementById(state.id).classList.add(state.style);
    // add icon
        document.getElementById(state.icon.id).classList.add(state.icon.style);
}

function removeButtonState(state) {
    // remove button style
    document.getElementById(state.id).classList.remove(state.style);
    // remove icon
    document.getElementById(state.icon.id).classList.remove(state.icon.style);
}

function setButtonState(id, state, removeStates, isDisabled) {
    document.getElementById(id).disabled = isDisabled;
    for(let remove of removeStates) {
        removeButtonState(remove);
    }
    addButtonState(state);

}

// output message to DOM
function outputMessage(message) {
    if(message.user.type === 'bot') return outputBotMessage(message); // if bot, send bot-style message
    const div = document.createElement('div');
    div.classList.add('message');
    if(message.user.username === username) div.classList.add('own');
    div.innerHTML = `<p class="meta">${message.user.username}<span class="timestamp">${message.time}</span></p>
                <p class="text">
                    ${message.text}
                </p>`;
    document.querySelector('.chat-messages').appendChild(div);
    socket.emit('increment-message-count', message.user.id);
}

function outputBotMessage(message) {
    const div = document.createElement('div');
    div.classList.add('bot-message');
    div.innerHTML = `<b>${message.user.username}: </b>${message.text}`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
    <h4>Users</h4>
    ${users.map(user => `<div class="user"><span id="${user.id}-count" class="badge badge-secondary">${user.messageCount.toString()}</span>${user.username}</div>`).join('')}
    <hr/>    
`;

}

// Add pending users to DOM
function outputInvitedUsers(emails) {
    let invited = document.createElement("div");
    invited.id = "invited";
    invited.innerHTML = "<h4>Pending Invites</h4>";
    userList.parentNode.insertBefore(invited, userList.nextSibling); // insert after "users" section

    for (let email of emails) {
        let user = document.createElement("div");
        user.id = email;
        user.classList.add("user");
        user.classList.add("inactive");
        user.innerHTML = `<span class="badge badge-warning">*</span>${email}`;
        invited.appendChild(user);
    }
}

function updateInvitedList(users) {
    console.log(users);
    for(let user in users) {
        console.log("user in users:", users[user].email);
        if(emailAddresses.includes(users[user].email)) {
            let thisChildId = users[user].email;
            console.log("removing child: ", thisChildId);
            document.getElementById(thisChildId).remove();
            emailAddresses = emailAddresses.filter(a => a !== users[user].email);
        }
    }
    if(emailAddresses.length === 0) document.getElementById("invited").remove();
    console.log(emailAddresses);
}

// Activate user
function activateUser(id) {
    document.getElementById(id).classList.remove("inactive");
}

// Deactivate user
function deactivateUser(id) {
    document.getElementById(id).classList.add("inactive");
}

// Update user message count
function updateMessageCount(messageCount) {
    document.getElementById(`${messageCount.userId}-count`).innerHTML = messageCount.count;
}

// Logout
function logout() {
    window.location.replace("/index.html");
}




