'use strict';

const Notification = require('../models/Notification');

class NotificationController {
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10);

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  }
}

module.exports = new NotificationController();
