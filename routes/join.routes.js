const url = require('url');
const express = require('express');
const router = express.Router();
const logger = require('../loaders/logger');
const { roomExists } = require('../repositories/room.repository');
const { usernameExistsInRoom, updateUsername } = require('../repositories/user.repository');
const { userDisconnected, userInvited } = require('../security/validation');

// Include Express Validator Functions
const { check, validationResult } = require('express-validator');

router.post('/', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const room = req.body.room;
    logger.info('[routes.join.validate]', {message: "Validating join request", username, email, room});

    await check('username').notEmpty().withMessage('Nickname cannot be blank')
        .isLength({min: 2}).withMessage('Nickname must be at least 2 characters')
        .not().custom(value => {
            return usernameExistsInRoom(value);
        }).withMessage('Room ID is invalid, please enter a valid room id')
        .trim().escape().run(req);
    await check('email').notEmpty().withMessage('Email cannot be blank')
        .isEmail().withMessage('Email address is invalid').custom(value => {
            logger.info('[routes.join.validate.customEmailCheck]', {message: "Checking errors", room, value});
            const email = value;
            return userInvited({room, email}) || userDisconnected({room, email});
        }).withMessage('Email still connected or not invited to this room').trim().escape().normalizeEmail().run(req);
    await check('room').notEmpty().withMessage('Room cannot be blank').custom(value => {
        return roomExists(value);
    }).withMessage('Room ID is invalid, please enter a valid room id').trim().escape().run(req);

    const errors = validationResult(req).array();

    logger.info('[routes.join.validate]', {message: "Checking validation errors"});

    if (errors.length > 0) {
        logger.info('[routes.join.validate]', {message: "Errors found", errors});
        res.sendStatus(403).render('join', {
            errors: errors,
            layout: 'index',
            username: username,
            email: email,
            room: room
        });
    } else {
        updateUsername({username, room, email});
        logger.info('[routes.join.validate]', {message: "No errors found, redirecting to chat page"});
        res.redirect(url.format({
            pathname:`/chat/${room}/${email}/${username}`
        }));
    }
});

router.get(['/', '/:room/:email/:username', '/:room/:email'],  (req, res) => {
    const email = req.params.email;
    const room = req.params.room;
    const username = req.params.username;

    res.sendStatus(200).render('join', {
        layout: 'index',
        email: email,
        room: room,
        username: username
    });
});



module.exports = router;