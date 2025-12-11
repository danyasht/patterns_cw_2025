'use strict';

const Booking = require('../models/Booking');

class Handler {
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  async handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return true;
  }
}

class AvailabilityHandler extends Handler {
  async handle(request) {
    const { gym, sectionName, date, time } = request;

    const section = gym.sections.find((s) => s.name === sectionName);
    if (!section) {
      throw new Error(`Section "${sectionName}" not found in this gym`);
    }

    const capacity = section.capacity;

    const currentBookings = await Booking.countDocuments({
      gym: gym._id,
      sectionName: sectionName,
      bookingDate: date,
      timeSlot: time,
      status: 'active',
    });

    if (currentBookings >= capacity) {
      throw new Error(`Section "${sectionName}" is full at ${time}.`);
    }

    return super.handle(request);
  }
}

class AgeHandler extends Handler {
  async handle(request) {
    const { user, sectionCategory } = request;

    const today = new Date();
    const birthDate = new Date(user.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (['boxing', 'gym'].includes(sectionCategory) && age < 14) {
      throw new Error(
        `Age restriction: You must be at least 14 for ${sectionCategory}.`
      );
    }

    return super.handle(request);
  }
}

module.exports = { AvailabilityHandler, AgeHandler };
