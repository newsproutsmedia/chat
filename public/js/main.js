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

socket.on('invalidRoom', room => {
    window.location.replace("/index.html");
});

// Join chatroom
socket.emit('joinRoom', { username, email, room });

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
});

// catch 'message' emitted in server.js
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scrolls down automatically
    //TODO instead of scrolling automatically, bring up a clickable arrow at bottom of message window that says "New Messages"
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('updated-message-count', messageCount => {
    console.log('updated-message-count:', messageCount);
    updateMessageCount(messageCount);
});

// Show Dashboard
showDash.addEventListener('click', function () {
    console.log('showing dash...');
    document.getElementById('dashboard').style.display = 'block';
});

// Hide Dashboard
hideDash.addEventListener('click', function () {
    console.log('hiding dash...');
    document.getElementById('dashboard').style.display = 'none';
});

// on sending message
// messageForm.addEventListener('submit', (e) => {
//    e.preventDefault(); // prevents automatic saving to file
//
//     // get message from "chat-form"
//     // form has an id of "msg", so we're getting the value of that input
//     let msg = document.getElementById('msg').innerHTML;
//
//     // Emit message to server
//     socket.emit('chatMessage', msg);
//
//     // Clear input
//     document.getElementById('msg').innerHTML = '';
//     document.getElementById('msg').style.content = 'Enter Message';
//     // Set focus to message input
//     // document.getElementById('msg').focus();
//
//     // Scroll to top of page
//     window.scrollTo(0, 0);
// });

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

// Update user message count
function updateMessageCount(messageCount) {
    document.getElementById(`${messageCount.userId}-count`).innerHTML = messageCount.count;
}

// Logout
function logout() {
    window.location.replace("/index.html");
}




