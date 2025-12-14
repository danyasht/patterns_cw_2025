'use strict';

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/user/:userId', bookingController.getUserBookings);
router.get('/all', bookingController.getAllBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
