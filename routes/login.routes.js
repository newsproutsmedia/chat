const url = require('url');
const express = require('express');
const router = express.Router();

// Include Express Validator Functions
const { validationResult } = require('express-validator');

router.post('/', (req, res) => {

});

router.post('/validate', (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const username = req.body.username;
    const email = req.body.email;
    const room = req.body.room;

    // check that the room is valid
    // check that the email is allowed in the room and not already logged in

    res.redirect(url.format({
        pathname:"/chat.html",
        query: {
            "username": username,
            "email": email,
            "room": room
        }
    }));
});

module.exports = router;