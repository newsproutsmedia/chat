let { users } = require('user.repository.js');
const UserService = require('../services/user.service');
const logger = require('../loaders/logger');

export function addUser(user) {
    users.push(user);
    return user;
}

/**
 * @desc get information about current user from id
 * @param {string} id
 * @return {Object} user - object containing current user info
 */
export function getCurrentUserById(id) {
    return users.find(user => user.id === id);
}

/**
 * @desc get information about current user from email
 * @param {string} room
 * @param {string} email
 * @return {Object} user - object containing current user info
 */
export function getCurrentUserByRoomAndEmail(room, email) {
    return users.find(user => user.room === room && user.email === email);
}

/**
 * @desc increases message count by 1
 * @param {string} id
 * @return {Object} - Object containing user Id and message count
 */
export function incrementUserMessageCount(id) {
    const userIndex = users.findIndex(user => user.id === id);
    users[userIndex].messageCount = users[userIndex].messageCount + 1;
    return {
        userId: id,
        count: users[userIndex].messageCount
    }
}

/**
 * @desc returns array of room user objects
 * @param {string} room
 * @return {array} - array of user objects
 */
export function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

/**
 * @desc returns index of user by email
 * @param {string } room
 * @param {string } email
 * @return {array}
 */
export function getUsersByEmailAndRoom(room, email) {
    return users.filter(user => user.room === room && user.email === email);
}

/**
 * @desc set user type
 * @param {string} type
 * @return string
 */
export function setType(type) {
    logger.info("[service.user.setUserType]", {type});
    if (!UserService.validateUserType(type)) {
        logger.warn("[service.user.setUserType]", {message: `INVALID USER TYPE: ${type} is not a valid user type`, type});
        return 'user';
    }
    return type;
}

/**
 * @desc remove all users from array
 * @param {string} room - id of room
 */
export function deleteAllUsersFromRoom(room) {
    logger.info('[service.user.deleteRoomUsers]', {message: 'deleting room users', room});
    users = users.filter(user => {
        return this.getRoomUsers(room).indexOf(user) === -1;
    });
    logger.info('[service.user.deleteRoomUsers]', {users});
}

/**
 * @desc set user status to "BLOCKED"
 * @param {string} id
 */
export function setUserBlocked(id) {
    const index = users.findIndex(user => user.id === id);
    users[index].status = "BLOCKED";
}

/**
 * @desc update user id
 * @param {string} oldSocketId
 * @param {string} newSocketId
 */
export function updateUserId(oldSocketId, newSocketId) {
    const index = users.findIndex(user => user.id === oldSocketId);
    users[index].id = newSocketId;
}

/**
 * @desc set status of user object
 * @param {number} index
 * @param {string} status
 */
export function setUserStatus(index, status) {
    users[index].status = status;
}

export function getUserIndexById(id) {
    return users.findIndex(user => user.id === id);
}

module.exports = { getUserIndexById,getCurrentUserById, getCurrentUserByRoomAndEmail, getRoomUsers, getUsersByEmailAndRoom, setUserStatus, setType, setUserBlocked, updateUserId, deleteAllUsersFromRoom, incrementUserMessageCount}

