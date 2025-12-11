'use strict';

const Booking = require('../models/Booking');
const Gym = require('../models/Gym');
const User = require('../models/User');
const UserSubscription = require('../models/UserSubscription');
const notificationService = require('../patterns/NotificationObserver');

const { AvailabilityHandler, AgeHandler } = require('../patterns/BookingChain');
const {
  StandardStrategy,
  SubscriptionStrategy,
  BonusStrategy,
  PriceContext,
} = require('../patterns/PriceStrategy');

class BookingService {
  async createBooking(data) {
    const {
      userId,
      gymId,
      sectionName,
      sectionCategory,
      bookingDate,
      timeSlot,
      paymentMethod,
    } = data;

    const gym = await Gym.findById(gymId);
    const user = await User.findById(userId);

    if (!gym) throw new Error('Gym not found');
    if (!user) throw new Error('User not found');

    const availabilityHandler = new AvailabilityHandler();
    const ageHandler = new AgeHandler();
    availabilityHandler.setNext(ageHandler);

    await availabilityHandler.handle({
      gym,
      user,
      sectionName,
      sectionCategory,
      date: bookingDate,
      time: timeSlot,
    });

    const activeSub = await UserSubscription.findOne({
      user: userId,
      gym: gymId,
      isActive: true,
      endDate: { $gte: new Date() },
    });

    const priceContext = new PriceContext();
    let finalPrice = 0;
    let usedMembershipType = 'Standard';
    let pointsChange = 0;

    if (activeSub) {
      priceContext.setStrategy(new SubscriptionStrategy());
      usedMembershipType = `Subscription (${activeSub.type})`;
      finalPrice = 0;
      pointsChange = 10;
    } else if (paymentMethod === 'bonuses') {
      const BONUS_PRICE = 100;

      if (user.bonusPoints < BONUS_PRICE) {
        throw new Error(
          `Not enough bonus points. You have ${user.bonusPoints}, need ${BONUS_PRICE}.`
        );
      }

      priceContext.setStrategy(new BonusStrategy());
      usedMembershipType = 'Paid with Bonuses';
      finalPrice = 0;
      pointsChange = -BONUS_PRICE;
    } else {
      priceContext.setStrategy(new StandardStrategy());
      usedMembershipType = 'Standard (One-time)';
      finalPrice = priceContext.executeStrategy(gym);
      pointsChange = 10;
    }

    const newBooking = new Booking({
      user: userId,
      gym: gymId,
      sectionName,
      sectionCategory,
      bookingDate,
      timeSlot,
      membershipType: usedMembershipType,
      totalPrice: finalPrice,
    });

    await newBooking.save();

    user.bonusPoints = (user.bonusPoints || 0) + pointsChange;
    await user.save();

    if (pointsChange > 0) {
      await notificationService.notify({
        userId: user._id,
        message: `You have got ${pointsChange} bonus points for the latest booking!`,
      });
    }

    return {
      message:
        pointsChange < 0
          ? `Booking confirmed! used ${Math.abs(pointsChange)} bonuses.`
          : `Booking confirmed! Price: $${finalPrice}. Earned ${pointsChange} points.`,
      booking: newBooking,
      newBonusBalance: user.bonusPoints,
    };
  }

  async getAllBookings() {
    return await Booking.find()
      .populate('user', 'name email')
      .populate('gym', 'name')
      .sort({ createdAt: -1 });
  }

  async cancelBooking(bookingId, userId, userRole) {
    const booking = await Booking.findById(bookingId).populate('gym');

    if (!booking) throw new Error('Booking not found');

    const isOwner = booking.user.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('Access denied');
    }

    if (booking.status !== 'active') {
      throw new Error('Booking is already cancelled or completed');
    }

    booking.status = 'cancelled';
    await booking.save();

    const initiator = isAdmin ? 'Administrator' : 'You';
    const message = `${initiator} cancelled booking at "${booking.gym.name}" for ${booking.bookingDate}.`;

    await notificationService.notify({
      userId: booking.user,
      message: message,
    });

    return booking;
  }

  async getUserBookings(userId) {
    return await Booking.find({ user: userId }).populate('gym');
  }
}

module.exports = new BookingService();
