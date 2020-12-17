// socket listeners
import {logout} from "../utils/logout.js";
import {outputRoomName, updateUrlRoom} from "../rooms.js";
import {incrementMaxUsers, outputUsers} from "../users.js";
import {outputInvitedUser, outputSendErrorMessage, outputSendFailureMessage, updateInvitedList, setInviteButtonStateAfterSend} from "../invitations.js";
import {outputMessage, outputUpdatedMessageCount} from "../messages.js";
import {setupAdmin} from "../admin.js";
import {emitIncrementMessageCount, emitJoinRoom} from "../emitters/socketEmitters.js";
import {redirectToError} from "../errors.js";
import {getIsAdmin} from "../admin.js";

const roomName = document.getElementById('roomName');
const userList = document.getElementById('users');

// Get username and room from URL
export let { username, email, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true // ignores non key/value data
});

export const socket = io({
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false,
    upgrade: true
});

let currentUser = {
    username,
    email,
    room
}

/**
 * @description set up listeners for socket.io
 */
export class SocketListeners {

    constructor() {
        this.onInvalidRoom();
        this.onAccessDenied();
        this.onConnect();
        this.onDestroyRoom();
        this.onLogoutUser();
        this.onRoomCreated();
        this.onRoomUsers();
        this.onMessage();
        this.onUpdatedMessageCount();
        this.onSetupAdmin();
        this.onInviteNotAllowed();
        this.onInviteSendError();
        this.onInviteSendSuccess();
        this.onInviteSendFailure();
        this.onInviteSendComplete();
        this.onFatalError();
        this.onDisconnect();
        this.onReconnectAttempt();
        this.onReconnect();
        socket.connect();
    }

    onConnect() {
        socket.on('connect', () => {
            console.log('client connected');
            emitJoinRoom(currentUser);
        });
    }

    onDestroyRoom() {
        socket.on('destroyRoom', () => {
            logout('roomDestroyed');
        });
    }

    onLogoutUser() {
        socket.on('logoutUser', message => {
            console.log('logout received');
            const logoutMessage = message || "logoutEvent";
            logout(logoutMessage);
        });
    }

    onInvalidRoom() {
        socket.on('invalidRoom', () => {
            console.log('invalid room');
            logout('invalidRoom');
        });
    }

    onAccessDenied() {
        socket.on('accessDenied', message => {
            console.log('access denied: ' + message);
            logout(message);
        });
    }

    onRoomCreated() {
        socket.on('roomCreated', room => {
            console.log('room created');
            updateUrlRoom(room);
        });
    }

    onRoomUsers() {
        socket.on('roomUsers', ({ room, users }) => {
            console.log('received room users');
            outputRoomName(roomName, room);
            outputUsers(userList, users);

            if(getIsAdmin()) updateInvitedList(users);
        });
    }

    onMessage() {
        socket.on('message', message => {
            console.log(message);
            outputMessage(message, username);
            emitIncrementMessageCount(message);
        });
    }

    onUpdatedMessageCount() {
        socket.on('updatedMessageCount', messageCount => {
            console.log('updatedMessageCount:', messageCount);
            outputUpdatedMessageCount(messageCount);
        });
    }

    onSetupAdmin() {
        socket.on('setupAdmin', user => {
            // add "invite" section to DOM
            console.log('setting up admin');
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
            outputInvitedUser({id, email});
            incrementMaxUsers();
        });
    }

    onInviteSendFailure() {
        socket.on('inviteSendFailure', ({id}) => {
            console.log("inviteSendFailure");
            outputSendFailureMessage(id);
        });
    }

    onInviteSendError() {
        socket.on('inviteSendError', ({id}) => {
            console.log("inviteSendError");
            outputSendErrorMessage(id);
        });
    }

    onInviteSendComplete() {
        socket.on('inviteSendComplete', ({success}) => {
            console.log("inviteSendComplete");
            setInviteButtonStateAfterSend(success);
        });
    }

    onFatalError() {
        socket.on('fatalError', ({error}) => {
           console.log("fatalError", error);
           redirectToError();
        });
    }

    onDisconnect() {
        socket.on('disconnect', reason => {
           console.log('User disconnected: ' + reason);
           // display fullscreen overlay showing disconnect notice with "attempting to reconnect"
            // update number of attempts
            // show disconnect countdown "disconnecting in X" -- start timer
           // attempt to reconnect
        });
    }
    onReconnectAttempt() {
        socket.on('reconnect_attempt', attemptNumber => {
            console.log('Attempting to reconnect...');
            // update reconnect number on overlay
        })
    }

    // on successful reconnect, remove overlay
    onReconnect() {
        socket.on('reconnect', () => {
            console.log('reconnected');
           // remove overlay
        });
    }
}