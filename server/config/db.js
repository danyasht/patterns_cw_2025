'use strict';

const mongoose = require('mongoose');

class Database {
  constructor() {
    this.uri = 'mongodb://127.0.0.1:27017/gym_booking';
  }

  async connect() {
    try {
      await mongoose.connect(this.uri);
      console.log('MongoDB connected');
    } catch (error) {
      console.error('Database connection error:', error);
    }
  }
}

module.exports = new Database();
