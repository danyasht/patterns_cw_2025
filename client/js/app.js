'use strict';

import ApiService from './api/api.js';
import GymRenderer from './components/GymRenderer.js';
import BookingModal from './components/BookingModal.js';
import UI from './ui.js';

class GymApp {
  constructor() {
    this.gymListContainer = document.querySelector('.gym-list-container');
    this.authSection = document.querySelector('.header-auth-section');
    this.searchBar = document.querySelector('.search-input');
    this.categoryFilter = document.querySelector('.filter-category');
    this.ageFilter = document.querySelector('.filter-age'); // <-- НОВЕ

    this.gymsCache = [];
    this.bookingModal = new BookingModal(this.renderUserHeader.bind(this));
    this.init();
  }

  init() {
    this.checkAuth();
    this.loadGyms();
    this.setupEvents();
  }

  checkAuth() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.renderUserHeader(JSON.parse(userStr));
    } else {
      this.renderGuestHeader();
    }
  }

  renderUserHeader(user) {
    const adminLink =
      user.role === 'admin'
        ? `<a href="admin.html" class="auth-nav-link nav-highlight">★ Admin Panel</a>`
        : '';

    this.authSection.innerHTML = `
      ${adminLink} 
      <span class="nav-bonus">🏆 ${user.bonusPoints || 0}</span>
      <a href="profile.html" class="auth-nav-link mr-md">My Profile</a>
      <span class="user-greeting mr-sm">Welcome, <strong>${
        user.name
      }</strong></span>
      <button class="auth-nav-btn logout-btn">Logout</button>
    `;

    this.authSection
      .querySelector('.logout-btn')
      .addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
  }

  renderGuestHeader() {
    this.authSection.innerHTML = `
      <a href="login.html" class="auth-nav-link mr-md">Log In</a>
      <a href="register.html" class="auth-nav-btn btn-outline-white">Register</a>
    `;
  }

  setupEvents() {
    if (this.searchBar)
      this.searchBar.addEventListener('input', () => this.loadGyms());
    if (this.categoryFilter)
      this.categoryFilter.addEventListener('change', () => this.loadGyms());
    if (this.ageFilter)
      this.ageFilter.addEventListener('change', () => this.loadGyms());

    this.gymListContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-book')) {
        const gymId = e.target.getAttribute('data-id');
        const gym = this.gymsCache.find((g) => g._id === gymId);
        if (gym) this.bookingModal.open(gym);
      }
      if (e.target.classList.contains('btn-subscribe')) {
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name');
        const price = e.target.getAttribute('data-price');
        this.handleBuySubscription(id, name, price);
      }
    });
  }

  async loadGyms() {
    try {
      const params = new URLSearchParams();
      if (this.searchBar.value) params.append('search', this.searchBar.value);
      if (this.categoryFilter.value)
        params.append('categories', this.categoryFilter.value);
      if (this.ageFilter.value) params.append('ageGroup', this.ageFilter.value);

      const gyms = await ApiService.get(`/gyms?${params.toString()}`);
      this.gymsCache = gyms;
      GymRenderer.render(gyms, this.gymListContainer);
    } catch (error) {
      console.error(error);
      this.gymListContainer.innerHTML =
        '<p class="status-error">Failed to load gyms.</p>';
    }
  }

  async handleBuySubscription(gymId, gymName, price) {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      UI.toast('Please log in first', 'info');
      setTimeout(() => (window.location.href = 'login.html'), 1000);
      return;
    }

    const user = JSON.parse(userStr);

    const message = `
      Buy Premium Subscription for "${gymName}"?
      
      Price: $${price} / month
      
      Includes:
      ✅ Unlimited Gym Access
      ✅ Swimming Pool
      ✅ Personal Trainer Access
      ✅ Free Bookings for 30 days
    `;

    const confirmed = await UI.confirm(message);
    if (!confirmed) return;

    try {
      await ApiService.post('/subscriptions', {
        userId: user.id,
        gymId: gymId,
        type: 'premium',
        durationInDays: 30,
      });
      UI.toast(`Subscription for ${gymName} activated!`, 'success');
    } catch (err) {
      UI.toast(err.message || 'Error buying subscription', 'error');
    }
  }
}

new GymApp();
