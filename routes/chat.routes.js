const url = require('url');
const express = require('express');
const router = express.Router();
const logger = require('../loaders/logger');
const UserRepository = require('../repositories/user.repository');
const roomList = require('../services/roomList');
const Invitations = require('../services/invitations');

router.get('/', function (req, res) {
    const username = req.query.username;
    const email = req.query.email;
    const room = req.query.room;
  
    if(username && email && room) {

        let admin = true;
        let invite = false;

        const user = UserRepository.getUsersByEmailAndRoom(room, email);
        const roomInvitations = Invitations.getRoomInvitations(room);

        if(room && user.length < 1 && roomInvitations.length > 0) {
            invite = roomInvitations.emails.map(email => email.email.includes(email));
        }

        const roomExists = roomList.roomExists(room);

        if((room && roomExists && invite) || (user.length > 0 && user.type !== "admin")) {
            admin = false;
        }
        logger.info('[routes.chat.paramsSet]', {message: "Params set, entering chat", user, invite, admin, roomExists, roomInvitations: roomInvitations});
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