'use strict';

const AuthService = require('../services/authService');

class AuthController {
  register = async (req, res) => {
    try {
      const result = await AuthService.register(req.body);

      res.status(201).json({
        message: 'User registered successfully',
        ...result,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);

      res.json({
        message: 'Login successful',
        user: user,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
}

module.exports = new AuthController();
