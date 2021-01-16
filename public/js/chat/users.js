import {getIsAdmin} from "./admin.js";
import {removeDisconnectUserButtonListeners, addDisconnectUserButtonListener} from "./listeners/userItemMenuListeners.js";

let maxUsers = 1;
let connectedUsers = [];

/**
 * @description output user list to the dom
 * @param {Element} elementId - id of wrapper element
 * @param {array} users - array of users in chat room
 */
export function outputUsers(elementId, users) {
    // Output "ONLINE" and "DISCONNECTED" users
    connectedUsers = [];
    elementId.innerHTML = "";
    const usersTitle = document.createElement("h4");
    usersTitle.innerText = "Users";
    elementId.appendChild(usersTitle);

    users.forEach(user => {
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `<div class="user">
            <span id="${user.id}-count" class="badge badge-secondary ${user.status.toLowerCase()}">${user.messageCount.toString()}</span>${user.username}
            ${adminUserItemMenu(user)}
         </div>`;

        elementId.appendChild(userDiv);

        addConnectedUser(user);

        if(document.getElementById(`${user.id}-disconnect`)) addDisconnectUserButtonListener(user.id);
        console.log("All Users Connected", connectedUsers);
    });
}

function addConnectedUser(user) {
    if(getIsAdmin()) {
        connectedUsers.push({id: user.id, username: user.username, email: user.email, status: user.status});
    } else {
        connectedUsers.push({id: user.id, username: user.username, status: user.status});
    }
}

export function emailInRoomUsers(email) {
    // This is not working, always returns false
    // FIX IT!
    const emailFound = connectedUsers.some(user => user.email === email);
    console.log(`Email (${email}) found in room: ${emailFound}`);
    return emailFound;
}

export function incrementMaxUsers() {
    maxUsers = maxUsers +1;
}

// Activate user
function activateUser(id) {
    document.getElementById(id).classList.remove("inactive");
}

// Deactivate user
function deactivateUser(id) {
    document.getElementById(id).classList.add("inactive");
}

// User item admin menu
function adminUserItemMenu(user) {
    if(getIsAdmin() && user.status !== "BLOCKED" && user.type !== "admin") {
        const content = `<a id="${user.id}-disconnect" class="user-list-item-menu" alt="Block this user" data-value="${user.id}" data-username="${user.username}" data-email="${user.email}"><i class="fas fa-sign-out-alt fa-1"></i></a>`;
        return content;
    }
    return "";
}