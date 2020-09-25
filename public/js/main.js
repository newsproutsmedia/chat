const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const roomName = document.getElementById('room-name');


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

// on sending message
chatForm.addEventListener('submit', (e) => {
   e.preventDefault(); // prevents automatic saving to file

    // get message from "chat-form"
    // form has an id of "msg", so we're getting the value of that input
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    // Set focus to message input
    e.target.elements.msg.focus();
});

// output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    if(message.username === "Me") div.classList.add('own');
    div.innerHTML = `<p class="meta">${message.username}<span style="float: right">${message.time}</span></p>
                <p class="text">
                    ${message.text}
                </p>`;
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

// Create a new room
function logout() {
    window.location.replace("/index.html");
}