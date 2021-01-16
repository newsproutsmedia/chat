const {getUserTypes} = require('../loaders/globals');

/**
 * @desc check if user type exists in global userTypes Set
 * @param {string} type
 * @return boolean
 */
function validateUserType(type) {
    return getUserTypes().has(type);
}

module.exports = { validateUserType };