let { users } = require('../data/users.data');
const logger = require('../loaders/logger');
const {getUserTypes} = require('../loaders/globals');


function addUser(user) {
    users.push(user);
    return user;
}

/**
 * @desc get information about current user from id
 * @param {string} id
 * @return {Object} user - object containing current user info
 */
function getCurrentUserById(id) {
    return users.find(user => user.id === id);
}

/**
 * @desc get information about current user from email
 * @param {string} room
 * @param {string} email
 * @return {Object} user - object containing current user info
 */
function getCurrentUserByRoomAndEmail(room, email) {
    return users.find(user => user.room === room && user.email === email);
}

/**
 * @desc increases message count by 1
 * @param {string} id
 * @return {Object} - Object containing user Id and message count
 */
function incrementUserMessageCount(id) {
    const userIndex = users.findIndex(user => user.id === id);
    logger.info('[service.user.incrementUserMessageCount]', {id, userIndex});
    users[userIndex].messageCount = users[userIndex].messageCount + 1;
    return {
        userId: id,
        count: users[userIndex].messageCount
    }
}

/**
 * @desc returns array of room user objects
 * @param {string} room
 * @param {string} socketId
 * @return {array} - array of user objects
 */
function getRoomUsersByUserType(room, socketId) {
    let user = getUserBySocketId(socketId);
    if(user && user.type === "admin") {
        return users.filter(user => user.room === room);
    }
    return users.filter(user => user.room === room && (user.status === "ONLINE" || user.status === "DISCONNECTED"));
}

/**
 * @desc returns array of room user objects
 * @param {string} room
 * @return {array} - array of user objects
 */
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function getUserBySocketId(id) {
    const user = users.filter(user => user.socket === id);
    logger.info('[service.user.getUserBySocketId]', {id});
    return user[0];
}


/**
 * @desc returns index of user by email
 * @param {string } room
 * @param {string } email
 * @return {array}
 */
function getUsersByEmailAndRoom(room, email) {
    return users.filter(user => user.room === room && user.email === email);
}

function getInvitedUsersByRoom(room) {
    return users.filter(user => user.status === "INVITED");
}

/**
 * @desc set user type
 * @param {string} type
 * @return string
 */
function setType(type) {
    logger.info("[service.user.setUserType]", {type});
    if (!validateUserType(type)) {
        logger.warn("[service.user.setUserType]", {message: `INVALID USER TYPE: ${type} is not a valid user type`, type});
        return 'user';
    }
    return type;
}

/**
 * @desc remove all users from array
 * @param {string} room - id of room
 */
function deleteAllUsersFromRoom(room) {
    logger.info('[service.user.deleteRoomUsers]', {message: 'deleting room users', room});
    users = users.filter(user => {
        return this.getRoomUsers(room).indexOf(user) === -1;
    });
    logger.info('[service.user.deleteRoomUsers]', {users});
}

/**
 * @desc set user status to "BLOCKED"
 * @param {string} socketId
 */
function setUserBlocked(socketId) {
    const index = users.findIndex(user => user.socket === socketId);
    users[index].status = "BLOCKED";
}

/**
 * @desc set status of user object
 * @param {number} index
 * @param {string} status
 */
function setUserStatus(index, status) {
    logger.info("[service.user.setUserStatus]", {status});
    users[index].status = status;
}

/**
 * @desc set socket id of user object
 * @param {number} index
 * @param {string} socket
 */
function setUserSocket(index, socket) {
    logger.info("[service.user.setUserSocket]", {socket});
    users[index].socket = socket;
}

function getUserIndexById(id) {
    return users.findIndex(user => user.id === id);
}

function usernameExistsInRoom(roomId, username) {
    const user = users.filter(user => user.room === roomId && user.username === username);
    return !!user.length;

}

function updateUsername({username, room, email}) {
    const user = getCurrentUserByRoomAndEmail(room, email);
    const index = getUserIndexById(user.id);
    users[index].username = username;
}

/**
 * @desc check if user type exists in global userTypes Set
 * @param {string} type
 * @return boolean
 */
function validateUserType(type) {
    return getUserTypes().has(type);
}

module.exports = { addUser, getUserIndexById,getCurrentUserById,
    getCurrentUserByRoomAndEmail, getInvitedUsersByRoom, getRoomUsers, getRoomUsersByUserType, getUsersByEmailAndRoom,
    getUserBySocketId, setUserStatus, setUserSocket, setType, setUserBlocked,
    deleteAllUsersFromRoom, incrementUserMessageCount,
    usernameExistsInRoom, updateUsername}

