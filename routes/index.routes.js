const url = require('url');
const express = require('express');
const session = require('express-session');
const router = express.Router();

// Include Express Validator Functions
const { check, validationResult } = require('express-validator');

router.get('/', function (req, res) {
    res.render('index', {
        success: req.session.success,
        errors: req.session.errors
    });
    req.session.errors = null;
});



module.exports = router;