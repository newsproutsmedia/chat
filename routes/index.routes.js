const url = require('url');
const express = require('express');
const router = express.Router();
const logger = require('../loaders/logger');
const { createRoomId } = require('../utils/roomId');
// Include Express Validator Functions
const { check, validationResult } = require('express-validator');

router.get('/',  (req, res) => {
    res.render('home');
});

router.post('/', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;

    // check that username and email are valid
    logger.info('[routes.index.post]', {message: "Validating request", username, email});

    await check('username').notEmpty().withMessage('Nickname cannot be blank')
        .isLength({min: 2}).withMessage('Nickname must be at least 2 characters')
        .trim().escape().run(req);
    await check('email').notEmpty().withMessage('Email cannot be blank')
        .isEmail().withMessage('Email address is invalid')
        .trim().escape().normalizeEmail().run(req);
    //
    const errors = validationResult(req).array();

    logger.info('[routes.index.post]', {message: "Checking validation errors"});

    if (errors.length > 0) {
        logger.info('[routes.index.post]', {message: "Errors found", errors});
        res.render('home', {
            errors: errors
        });
    } else {
        logger.info('[routes.index.post]', {message: "No errors found, redirecting to chat page"});

        // create room id
        const room = createRoomId();

        res.redirect(url.format({
            pathname:"/chat",
            query: {
                "username": username,
                "email": email,
                "room": room
            }
        }));
    }
})

module.exports = router;