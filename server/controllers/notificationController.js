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

  async markRead(req, res) {
    try {
      const { userId } = req.params;
      await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Error marking read' });
    }
  }
}

module.exports = new NotificationController();
