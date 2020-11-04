// socket listeners
import {logout} from "../utils/logout";
import {outputRoomName, updateUrlRoom} from "../rooms";
import {incrementMaxUsers, outputUsers} from "../users";
import {outputInvitedUser, outputSendErrorMessage, outputSendFailureMessage, updateInvitedList} from "../invitations";
import {outputMessage, updateMessageCount} from "../messages";
import {setupAdmin} from "../admin";
import {emitIncrementMessageCount, emitJoinRoom} from "../emitters/socketEmitters";

const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
let { username, email, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true // ignores non key/value data
});

export const socket = io();

let currentUser = {
    username,
    email,
    room
}

export class SocketListeners {

    constructor() {
        this.onInvalidRoom();
        emitJoinRoom(currentUser);
        this.onRoomCreated();
        this.onRoomUsers();
        this.onMessage();
        this.onUpdatedMessageCount();
        this.onSetupAdmin();
        this.onInviteNotAllowed();
        this.onInviteSendError();
        this.onInviteSendSuccess();
        this.onInviteSendFailure();
    }

    onInvalidRoom() {
        socket.on('invalidRoom', room => {
            logout();
        });
    }

    onRoomCreated() {
        // listen for roomCreated, set new room value
        socket.on('roomCreated', room => {
            updateUrlRoom(room);
        });
    }

    onRoomUsers() {
        // Get room and users
        socket.on('roomUsers', ({ room, users }) => {
            outputRoomName(roomName, room);
            outputUsers(userList, users);
            updateInvitedList(users);
        });
    }

    onMessage() {
        // catch 'message' emitted in server.js
        socket.on('message', message => {
            console.log(message);
            outputMessage(message, username);
            emitIncrementMessageCount(message);
        });
    }

    onUpdatedMessageCount() {
        socket.on('updatedMessageCount', messageCount => {
            console.log('updatedMessageCount:', messageCount);
            updateMessageCount(messageCount);
        });
    }

    onSetupAdmin() {
        socket.on('setupAdmin', user => {
            // add "invite" section to DOM
            setupAdmin(user);
        });
    }

    onInviteNotAllowed() {
        socket.on('inviteNotAllowed', () => {
            console.log("inviteNotAllowed");
            // remove invite section
            // display message saying that user must be the chat admin to invite members
        });
    }

    onInviteSendSuccess() {
        socket.on('inviteSendSuccess', ({id, email}) => {
            console.log("inviteSendSuccess");
            // if admin, show invited users, greyed out (or with "not joined" badge), in users section
            outputInvitedUser({id, email});
            // adjust users list
            incrementMaxUsers();
        });
    }

    onInviteSendFailure() {
        socket.on('inviteSendFailure', ({id}) => {
            console.log("inviteSendFailure");
            // display "there was a problem" message
            outputSendFailureMessage(id);
        });
    }

    onInviteSendError() {
        socket.on('inviteSendError', ({id}) => {
            console.log("inviteSendError");
            // display "there was a problem" message
            outputSendErrorMessage(id);
        });
    }
}