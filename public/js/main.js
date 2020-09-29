const messageSubmit = document.getElementById('message-submit');
const messageInput = document.getElementById('msg');
const showDash = document.getElementById('show-dash');
const hideDash = document.getElementById('hide-dash');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const roomName = document.getElementById('room-name');
const initHeight = window.innerHeight;


// Get username and room from URL
let { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true // ignores non key/value data
});

const socket = io();

socket.on('invalidRoom', room => {
    window.location.replace("/index.html");
});

// Join chatroom
socket.emit('joinRoom', { username, room });

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
    console.log(users);
});

// catch 'message' emitted in server.js
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scrolls down automatically
    //TODO instead of scrolling automatically, bring up a clickable arrow at bottom of message window that says "New Messages"
    chatMessages.scrollTop = chatMessages.scrollHeight;


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
messageSubmit.addEventListener('click', (e) => {
   e.preventDefault(); // prevents automatic saving to file

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
});

messageInput.addEventListener('blur', () => {
    window.scrollTo(0, 0);
})

messageInput.addEventListener('focus', () => {
    let diffHeight = initHeight - window.innerHeight;
    document.getElementById('msg').style.content = diffHeight.toString();
    window.scrollTo(0, diffHeight);
})

// output message to DOM
function outputMessage(message) {
    if(message.isUser === false) return outputBotMessage(message); // if bot, send bot-style message
    const div = document.createElement('div');
    div.classList.add('message');
    if(message.username === "Me") div.classList.add('own');
    div.innerHTML = `<p class="meta">${message.username}<span class="timestamp">${message.time}</span></p>
                <p class="text">
                    ${message.text}
                </p>
`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputBotMessage(message) {
    const div = document.createElement('div');
    div.classList.add('bot-message');
    div.innerHTML = `<b>${message.username}: </b>${message.text}`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

// Logout
function logout() {
    window.location.replace("/index.html");
}




