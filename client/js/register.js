'use strict';

import ApiService from './api/api.js';
import UI from './ui.js';

class RegisterManager {
  constructor() {
    this.form = document.querySelector('.register-form');
    this.nameInput = document.querySelector('.name-input');
    this.emailInput = document.querySelector('.email-input');
    this.dobInput = document.querySelector('.dob-input');
    this.passwordInput = document.querySelector('.password-input');

    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const userData = {
      name: this.nameInput.value,
      email: this.emailInput.value,
      birthDate: this.dobInput.value,
      password: this.passwordInput.value,
    };

    try {
      await ApiService.post('/auth/register', userData);

      UI.toast('Registration successful! Please login.', 'success');
      this.form.reset();

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (error) {
      UI.toast(error.message, 'error');
    }
  }
}

new RegisterManager();
