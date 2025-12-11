'use strict';

const Notification = require('../models/Notification');

class Observer {
  async update(data) {
    throw new Error('Method update() must be implemented');
  }
}

class DBNotificationObserver extends Observer {
  async update(data) {
    const { userId, message } = data;
    try {
      await Notification.create({ user: userId, message });
    } catch (err) {
      console.error('Error saving notification:', err);
    }
  }
}

class EmailNotificationObserver extends Observer {
  async update(data) {
    const { message } = data;
  }
}

class NotificationService {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  async notify(data) {
    for (const observer of this.observers) {
      await observer.update(data);
    }
  }
}

const notificationService = new NotificationService();
notificationService.subscribe(new DBNotificationObserver());
notificationService.subscribe(new EmailNotificationObserver());

module.exports = notificationService;
