const url = require('url');
const express = require('express');
const router = express.Router();
const logger = require('../loaders/logger');
const UserRepository = require('../repositories/user.repository');
const roomRepository = require('../repositories/room.repository');

router.get('/:room/:email/:username', function (req, res) {
    const username = req.params.username;
    const email = req.params.email;
    const room = req.params.room;
    const user = UserRepository.getCurrentUserByRoomAndEmail(room, email);
    const roomExists = roomRepository.roomExists(room);
  
    if(username && email && room && user && roomExists) {

        logger.info('[routes.chat.paramsSet]', {message: "Params set, entering chat", user, roomExists});
        res.sendStatus(200).render('chat', {
            layout: 'index',
            username: username,
            email: email,
            room: room,
            type: user.type
        });
    } else {
        res.sendStatus(302).redirect(`/join/${room}/${email}/${username}`);
    }
});

module.exports = router;