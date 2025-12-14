'use strict';

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/user/:userId', notificationController.getUserNotifications);
router.patch('/read/:userId', notificationController.markRead);

module.exports = router;
