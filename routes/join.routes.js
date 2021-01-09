const url = require('url');
const express = require('express');
const session = require('express-session');
const router = express.Router();
const logger = require('../loaders/logger');
const { validateRoomId } = require('../security/validation');

// Include Express Validator Functions
const { check, validationResult } = require('express-validator');

router.post('/validate', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const room = req.body.room;
    logger.info('[routes.join.validate]', {message: "Validating join request", username, email, room});

    await check('username').notEmpty().withMessage('Nickname cannot be blank')
        .isLength({min: 2}).withMessage('Nickname must be at least 2 characters')
        .trim().escape().run(req);
    await check('email').notEmpty().withMessage('Email cannot be blank')
        .isEmail().withMessage('Email address is invalid')
        .trim().escape().normalizeEmail().run(req);
    await check('room').notEmpty().withMessage('Room cannot be blank').custom(value => {
        return validateRoomId(value);
    }).withMessage('Room ID is invalid, please enter a valid room id').trim().escape().run(req);

    const errors = validationResult(req);

    logger.info('[routes.join.validate]', {message: "Checking validation errors"});

    if (errors) {
        logger.info('[routes.join.validate]', {message: "Errors found", errors});
        req.session.errors = errors;
        req.session.success = false;
        res.render('join', {
            layout: 'index',
            errors: errors,
            success: req.session.success,
            username: username,
            email: email,
            room: room
        });
    } else {
        logger.info('[routes.join.validate]', {message: "No errors found, redirecting to chat page"});
        req.session.sucess = true;
        res.redirect(url.format({
            pathname:"/chat.html",
            query: {
                "username": username,
                "email": email,
                "room": room
            }
        }));
    }


    // check that the room is valid
    // check that the email is allowed in the room and not already logged in


});

router.get('/', function (req, res) {
    const email = req.query.email;
    const room = req.query.room;

    res.render('join', {
        layout: 'index',
        email: email,
        room: room,
        success: req.session.success,
        errors: req.session.errors
    });
    req.session.errors = null;
});



module.exports = router;