'use strict';
const express = require('express');

const multiavatarController = require('../controllers/multiavatar');

const router = express.Router();

router.get('/avatar', multiavatarController.avatarStreamController);

module.exports = router;
