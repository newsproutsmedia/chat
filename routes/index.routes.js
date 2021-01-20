const url = require('url');
const express = require('express');
const router = express.Router();
const logger = require('../loaders/logger');
const { createRoom } = require('../services/room.service');
const { getAllRooms } = require('../repositories/room.repository');
const { check, validationResult } = require('express-validator');
const { createUser } = require('../services/user.service');

router.get(['/', '/index', 'index.html', 'home', 'home.html'],  (req, res) => {
    res.status(200).render('home');
});

router.post('/', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;

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
        res.sendStatus(400).render('home', {
            errors: errors
        });
    } else {
        logger.info('[routes.index.post]', {message: "No errors found, redirecting to chat page"});

        const room = createRoom();
        logger.info('[routes.index.post]', {rooms: getAllRooms()});

        const user = createUser({username: username, email: email, room: room.getId(), type: "admin"});
        logger.info('[routes.index.post]', {message: "User created:", user});

        res.redirect(url.format({
            pathname:`/chat/${room.getId()}/${email}/${username}`
        }));
    }
})

module.exports = router;