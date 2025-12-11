'use strict';

const SubscriptionService = require('../services/subscriptionService');

class SubscriptionController {
  createSubscription = async (req, res) => {
    try {
      const { userId, gymId, type, durationInDays } = req.body;

      const sub = await SubscriptionService.activateSubscription(
        userId,
        gymId,
        type,
        durationInDays
      );

      res.status(201).json({
        message: 'Subscription activated!',
        subscription: sub,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error activating subscription' });
    }
  };

  getUserSubscriptions = async (req, res) => {
    try {
      const { userId } = req.params;
      const subs = await SubscriptionService.getUserSubscriptionsHistory(
        userId
      );
      res.json(subs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  cancelSubscription = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      await SubscriptionService.cancelSubscription(id, userId);
      res.json({ message: 'Subscription cancelled' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
}

module.exports = new SubscriptionController();
