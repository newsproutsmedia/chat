const {userTypes} = require('../loaders/globals');

/**
 * @desc check if user type exists in global userTypes Set
 * @param {string} type
 * @return boolean
 */
function validateUserType(type) {
    return userTypes.has(type);
}

module.exports = { validateUserType };