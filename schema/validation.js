// Include Express Validator Functions
const { check } = require('express-validator');

const joinValidate = [
    // Check Username
    check('username').notEmpty().withMessage('Username cannot be blank')
        .isLength({min: 2}).withMessage('Username must be at least 2 characters')
        .trim().escape(),
    // Check Email
    check('email').notEmpty().withMessage('Email cannot be blank')
        .isEmail().withMessage('Email address is invalid')
        .trim().escape().normalizeEmail(),
    // Check Room
    check('room').notEmpty().withMessage('Room cannot be blank').trim().escape()
];