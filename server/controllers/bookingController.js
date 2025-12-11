'use strict';

const BookingService = require('../services/bookingService');

class BookingController {
  createBooking = async (req, res) => {
    try {
      const result = await BookingService.createBooking(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  getUserBookings = async (req, res) => {
    try {
      const { userId } = req.params;
      const bookings = await BookingService.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  };

  getAllBookings = async (req, res) => {
    try {
      const bookings = await BookingService.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  cancelBooking = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, role } = req.body;

      const result = await BookingService.cancelBooking(id, userId, role);
      res.json({ message: 'Booking cancelled', booking: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
}

module.exports = new BookingController();
