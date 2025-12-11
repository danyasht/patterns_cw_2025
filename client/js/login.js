'use strict';

import ApiService from './api/api.js';

class LoginManager {
  constructor() {
    this.form = document.querySelector('.login-form');
    this.emailInput = document.querySelector('.email-input');
    this.passwordInput = document.querySelector('.password-input');
    this.messageBox = document.querySelector('.status-message');

    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.clearMessage();

    const userData = {
      email: this.emailInput.value,
      password: this.passwordInput.value,
    };

    try {
      const data = await ApiService.post('/auth/login', userData);

      this.showMessage('Login successful! Redirecting...', 'success');

      localStorage.setItem('user', JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 1000);
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  showMessage(text, type) {
    this.messageBox.textContent = text;
    this.messageBox.classList.remove('status-success', 'status-error');

    if (type === 'success') {
      this.messageBox.classList.add('status-success');
    } else {
      this.messageBox.classList.add('status-error');
    }
  }

  clearMessage() {
    this.messageBox.textContent = '';
    this.messageBox.className = 'status-message';
  }
}

new LoginManager();
