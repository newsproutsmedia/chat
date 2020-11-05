let maxUsers = 1;

/**
 * @description output user list to the dom
 * @param {Element} elementId - id of wrapper element
 * @param {array} users - array of users in chat room
 */
export function outputUsers(elementId, users) {
    elementId.innerHTML = `
    <h4>Users</h4>
    ${users.map(user => `<div class="user"><span id="${user.id}-count" class="badge badge-secondary">${user.messageCount.toString()}</span>${user.username}</div>`).join('')}
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