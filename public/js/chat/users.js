import {getIsAdmin} from "./admin.js";
import {UserItemMenuListeners} from "./listeners/userItemMenuListeners.js";

let maxUsers = 1;

/**
 * @description output user list to the dom
 * @param {Element} elementId - id of wrapper element
 * @param {array} users - array of users in chat room
 */
export function outputUsers(elementId, users) {
    elementId.innerHTML = `
    <h4>Users</h4>
    ${users.map(user => 
        `<div class="user">
            <span id="${user.id}-count" class="badge badge-secondary">${user.messageCount.toString()}</span>${user.username}
            ${adminUserItemMenu(user.id)}
         </div>`).join('')}
    <hr/>    
`;

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
function adminUserItemMenu(id) {
    if(getIsAdmin()) {
        const content = `<span id="${id}-disconnect" class="userListItemMenu"><i class="fas fa-sign-out-alt fa-1" alt="Disconnect this user"></i></span>`;
        //new UserItemMenuListeners(id);
        return content;
    }
    return "";
}