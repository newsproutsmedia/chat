const url = require('url');
const express = require('express');
const router = express.Router();
const logger = require('../loaders/logger');
const User = require('../models/user');
const UserRepository = require('../repositories/user.repository');

router.get('/', function (req, res) {
    const username = req.query.username;
    const email = req.query.email;
    const room = req.query.room;
    let admin = false;

    const user = UserRepository.getUsersByEmailAndRoom(room, email);

    if(user && user.type === "admin") {
        admin = true;
    }

    if(username && email) {
        res.render('chat', {
            layout: 'index',
            username: username,
            email: email,
            room: room,
            admin: admin
        });
    } else {
        res.redirect(`/join?username=${username}&email=${email}&room=${room}`);
    }
});

module.exports = router;