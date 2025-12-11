'use strict';

const User = require('../models/User');

class AuthService {
  async register(userData) {
    const { name, email, password, birthDate } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = new User({
      name,
      email,
      password,
      birthDate,
    });

    await newUser.save();

    return { userId: newUser._id };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== password) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
      role: user.role,
      bonusPoints: user.bonusPoints,
    };
  }
}

module.exports = new AuthService();
