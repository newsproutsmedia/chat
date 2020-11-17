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
    removeDisconnectUserButtonListeners(connectedUsers);
    connectedUsers = [];
    elementId.innerHTML = "";
    const usersTitle = document.createElement("h4");
    usersTitle.innerText = "Users";
    elementId.appendChild(usersTitle);

    users.forEach(user => {
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `<div class="user">
            <span id="${user.id}-count" class="badge badge-secondary">${user.messageCount.toString()}</span>${user.username}
            ${adminUserItemMenu(user)}
         </div>`;
        elementId.appendChild(userDiv);
        users.push({id: user.id, username: user.username, status: user.status});
        if(document.getElementById(`${user.id}-disconnect`)) addDisconnectUserButtonListener(user.id);
    });

    const addLine = document.createElement("hr");
    elementId.appendChild(addLine);
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
    if(getIsAdmin() && user.status !== "TERMINATED" && user.type !== "admin") {
        const content = `<a id="${user.id}-disconnect" class="userListItemMenu" alt="Disconnect this user" data-value="${user.id}"><i class="fas fa-sign-out-alt fa-1"></i></a>`;
        return content;
    }
    return "";
}