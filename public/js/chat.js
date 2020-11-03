import {outputUsers} from "./chat/users";
import {outputRoomName} from "./chat/rooms";
import {setupAdmin, updateInvitedList, outputInvitedUser, outputSendFailureMessage, outputSendErrorMessage, outputInviteDiv} from "./chat/admin";
import {outputMessage, outputBotMessage, updateMessageCount} from "./chat/messages";
import {logout} from "./chat/utils/logout";

// move variables into appropriate JS files!
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
let currentUser = {
    username,
    email,
    room
}

socket.on('invalidRoom', room => {
    logout();
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
    outputRoomName(roomName, room);
    outputUsers(userList, users);
    updateInvitedList(users);
});

// catch 'message' emitted in server.js
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    socket.emit('increment-message-count', message.user.id);
});

socket.on('updatedMessageCount', messageCount => {
    console.log('updatedMessageCount:', messageCount);
    updateMessageCount(messageCount);
});



/*
ADMIN FUNCTIONALITY
 */

socket.on('setupAdmin', user => {
    // add "invite" section to DOM
    setupAdmin(user);
});



/*
MAIL FUNCTIONALITY
 */
socket.on('inviteNotAllowed', () => {
    console.log("inviteNotAllowed");
    // remove invite section
    // display message saying that user must be the chat admin to invite members
});

socket.on('inviteSendSuccess', ({id, email}) => {
    console.log("inviteSendSuccess");
    // if admin, show invited users, greyed out (or with "not joined" badge), in users section
    outputInvitedUser({id, email});
    // adjust users list
    maxUsers = maxUsers + 1;
});

socket.on('inviteSendFailure', ({id}) => {
    console.log("inviteSendFailure");
    // display "there was a problem" message
    outputSendFailureMessage(id);
});

socket.on('inviteSendError', ({id}) => {
    console.log("inviteSendError");
    // display "there was a problem" message
    outputSendErrorMessage(id);
});






