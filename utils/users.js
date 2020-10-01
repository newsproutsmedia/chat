const users = [];

// Join user to chat
function userJoin(id, username, room, type) {
    let messageCount = 0;
    // ES6 object, so id: id ,etc.
    const user = {
        id,
        username,
        room,
        messageCount,
        type
    }
    users.push(user);

    return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id == id);
}

// Get user message count
function getUserMessageCount(id) {
    const selectedUser = users.find(user => user.id == id);
    if(!selectedUser.messageCount) {
        return 0;
    }
    return selectedUser.messageCount;
}

// Increment user message count
function incrementUserMessageCount(id) {
    const userIndex = users.findIndex(user => user.id == id);
    users[userIndex].messageCount = users[userIndex].messageCount + 1;
    const messageCountObject = {
        userId: id,
        count: users[userIndex].messageCount
    }
    return messageCountObject;
}


// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    // return user
    if(index !== -1) return users.splice(index, 1)[0];
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    getUserMessageCount,
    incrementUserMessageCount,
    userLeave,
    getRoomUsers
}
