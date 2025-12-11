'use strict';

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController.js');

router.post('/', subscriptionController.createSubscription);
router.get('/user/:userId', subscriptionController.getUserSubscriptions);
router.patch('/:id/cancel', subscriptionController.cancelSubscription);

module.exports = router;
