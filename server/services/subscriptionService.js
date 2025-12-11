'use strict';

const UserSubscription = require('../models/UserSubscription');

class SubscriptionService {
  async activateSubscription(userId, gymId, type, durationInDays = 30) {
    await UserSubscription.updateMany(
      { user: userId, isActive: true },
      { isActive: false }
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationInDays);

    const newSub = new UserSubscription({
      user: userId,
      gym: gymId,
      type,
      startDate,
      endDate,
      isActive: true,
    });

    return await newSub.save();
  }

  async cancelSubscription(subId, userId) {
    const sub = await UserSubscription.findById(subId);

    if (!sub) throw new Error('Subscription not found');

    if (sub.user.toString() !== userId) {
      throw new Error('Access denied');
    }

    if (!sub.isActive) {
      throw new Error('Subscription is already inactive');
    }

    sub.isActive = false;
    await sub.save();
    return sub;
  }

  async getUserSubscriptionsHistory(userId) {
    return await UserSubscription.find({ user: userId })
      .populate('gym')
      .sort({ startDate: -1 });
  }

  async getActiveSubscription(userId) {
    return await UserSubscription.findOne({
      user: userId,
      isActive: true,
      endDate: { $gte: new Date() },
    });
  }
}

module.exports = new SubscriptionService();
