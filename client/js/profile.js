'use strict';

import ApiService from './api/api.js';
import UI from './ui.js';

class ProfileManager {
  constructor() {
    this.nameSpan = document.querySelector('.profile-name');
    this.emailSpan = document.querySelector('.profile-email');
    this.roleSpan = document.querySelector('.profile-role');
    this.bonusSpan = document.querySelector('.profile-bonuses');
    this.bookingsList = document.querySelector('.bookings-list');
    this.subscriptionsList = document.querySelector('.subscriptions-list');
    this.logoutBtn = document.querySelector('.logout-btn');
    this.notificationsList = document.querySelector('.notifications-list');
    this.init();
  }

  init() {
    const user = this.checkAuth();
    if (user) {
      this.loadUserInfo(user);
      this.loadData(user);
      this.loadNotifications(user.id);
    }
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
    }
  }

  checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      window.location.href = 'login.html';
      return null;
    }
    return JSON.parse(userStr);
  }

  loadUserInfo(user) {
    this.nameSpan.textContent = user.name;
    this.emailSpan.textContent = user.email;
    this.roleSpan.textContent = user.role;
    this.bonusSpan.textContent = user.bonusPoints || '0';
  }

  async loadData(user) {
    try {
      const [bookings, subscriptions] = await Promise.all([
        ApiService.get(`/bookings/user/${user.id}`),
        ApiService.get(`/subscriptions/user/${user.id}`),
      ]);
      this.renderSubscriptions(subscriptions, user.id);
      this.renderBookings(bookings, user.id);
    } catch (error) {
      console.error(error);
      this.bookingsList.innerHTML =
        '<p class="status-error">Failed to load data</p>';
    }
  }

  // --- Subscriptions Render ---
  renderSubscriptions(subs, userId) {
    if (!this.subscriptionsList) return;
    this.subscriptionsList.innerHTML = '';

    if (!subs || subs.length === 0) {
      this.subscriptionsList.innerHTML =
        '<p class="text-center">No active subscriptions.</p>';
      return;
    }

    subs.forEach((sub) => {
      const gymName = sub.gym ? sub.gym.name : 'Unknown Gym';
      const endDate = new Date(sub.endDate).toLocaleDateString();
      const isActive = sub.isActive && new Date(sub.endDate) > new Date();

      const itemClass = isActive ? 'item-active' : 'item-inactive';

      const cancelBtn = isActive
        ? `<button class="btn-text-danger mt-xs btn-cancel-sub" data-id="${sub._id}">Cancel Subscription</button>`
        : '';

      const html = `
        <div class="booking-item ${itemClass}">
          <div class="booking-header">
            <h3>${gymName} (${sub.type.toUpperCase()})</h3>
            <span class="${isActive ? 'status-success' : 'status-error'}">
              ${isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div class="booking-details">
             <p>Valid until: <strong>${endDate}</strong></p>
             ${cancelBtn}
          </div>
        </div>
      `;
      this.subscriptionsList.insertAdjacentHTML('beforeend', html);
    });

    this.subscriptionsList
      .querySelectorAll('.btn-cancel-sub')
      .forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const confirmed = await UI.confirm('Cancel subscription?');
          if (!confirmed) return;

          try {
            const subId = e.target.getAttribute('data-id');
            await ApiService.patch(`/subscriptions/${subId}/cancel`, {
              userId,
            });
            UI.toast('Subscription cancelled', 'success');
            setTimeout(() => location.reload(), 1000);
          } catch (err) {
            UI.toast(err.message, 'error');
          }
        });
      });
  }

  // --- History Render ---
  renderBookings(bookings, userId) {
    this.bookingsList.innerHTML = '';
    if (!bookings || bookings.length === 0) {
      this.bookingsList.innerHTML =
        '<p class="text-center">No bookings yet.</p>';
      return;
    }

    bookings.reverse().forEach((booking) => {
      const gymName = booking.gym ? booking.gym.name : 'Unknown Gym';
      let statusClass = 'status-success';
      if (booking.status === 'cancelled') statusClass = 'status-error';
      if (booking.status === 'completed') statusClass = 'status-text';

      const cancelBtn =
        booking.status === 'active'
          ? `<button class="btn-text-danger mt-xs btn-cancel-booking" data-id="${booking._id}">Cancel Booking</button>`
          : '';

      const html = `
        <div class="booking-item">
            <div class="booking-header">
                <h3>${gymName}</h3>
                <span class="${statusClass}">
                    ${booking.status.toUpperCase()}
                </span>
            </div>
            <div class="booking-details">
                <p>📅 <strong>Date:</strong> ${booking.bookingDate} at ${
        booking.timeSlot
      }</p>
                <p>💳 <strong>Type:</strong> ${booking.membershipType}</p>
                <p>💰 <strong>Total:</strong> $${booking.totalPrice}</p>
                ${cancelBtn}
            </div>
        </div>
      `;
      this.bookingsList.insertAdjacentHTML('beforeend', html);
    });

    this.bookingsList.querySelectorAll('.btn-cancel-booking').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const confirmed = await UI.confirm('Cancel booking?');
        if (!confirmed) return;

        try {
          const bookingId = e.target.getAttribute('data-id');
          await ApiService.patch(`/bookings/${bookingId}/cancel`, { userId });
          UI.toast('Booking cancelled', 'success');
          setTimeout(() => location.reload(), 1000);
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    });
  }

  // --- Notifications ---
  async loadNotifications(userId) {
    if (!this.notificationsList) return;

    try {
      const notifications = await ApiService.get(
        `/notifications/user/${userId}`
      );
      this.renderNotifications(notifications);
    } catch (error) {
      console.error(error);
      this.notificationsList.innerHTML =
        '<p class="status-error">Failed to load notifications.</p>';
    }
  }

  renderNotifications(list) {
    this.notificationsList.innerHTML = '';

    if (!list || list.length === 0) {
      this.notificationsList.innerHTML =
        '<p class="text-center status-text">No notifications yet.</p>';
      return;
    }

    list.forEach((note) => {
      const dateStr = new Date(note.createdAt).toLocaleString();

      const item = document.createElement('div');
      item.className = 'notification-item';

      item.innerHTML = `
        <div class="notif-icon">📣</div>
        <div class="notif-content">
          <p class="notif-msg">${note.message}</p>
          <span class="notif-date">${dateStr}</span>
        </div>
      `;

      this.notificationsList.appendChild(item);
    });
  }
}

new ProfileManager();
