'use strict';

import ApiService from './api/api.js';
import GymBuilder from './gymBuilder.js';
import UI from './ui.js';

class AdminManager {
  constructor() {
    this.gymForm = document.querySelector('.add-gym-form');
    this.gymListContainer = document.querySelector('.admin-gym-list');
    this.statusMessage = document.querySelector('.status-message');
    this.logoutBtn = document.querySelector('.logout-btn');

    this.imageInput = document.querySelector('.gym-image');
    this.secNameInput = document.querySelector('.section-name');
    this.secCatInput = document.querySelector('.section-category');
    this.secCapInput = document.querySelector('.section-capacity');
    this.secSchedInput = document.querySelector('.section-schedule');

    this.btnAddSection = document.querySelector('.btn-add-section');
    this.sectionsListUl = document.querySelector('.sections-list');

    this.bookingsContainer = document.querySelector('.admin-bookings-list');
    this.btnReport = document.querySelector('#btn-generate-report');
    this.reportOutput = document.querySelector('.reports-output');

    this.tempSections = [];
    this.init();
  }

  init() {
    if (!this.checkAdminAuth()) return;

    if (this.gymForm) {
      this.gymForm.addEventListener('submit', (e) => this.handleAddGym(e));
    }
    if (this.btnAddSection) {
      this.btnAddSection.addEventListener('click', () =>
        this.handleAddToTempList()
      );
    }
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
    }

    if (this.btnReport) {
      this.btnReport.addEventListener('click', () => this.loadReports());
    }

    this.loadGyms();
    this.loadAllBookings();
  }

  checkAdminAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      window.location.href = 'login.html';
      return false;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      alert('Access Denied.');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  handleAddToTempList() {
    const name = this.secNameInput.value;
    const category = this.secCatInput.value;
    const capacity = this.secCapInput.value;
    const schedule = this.secSchedInput.value;

    if (!name || !capacity || !schedule) {
      UI.toast('Please fill in all section fields', 'error');
      return;
    }

    this.tempSections.push({
      name,
      category,
      capacity,
      schedule,
    });
    this.renderTempSections();

    this.secNameInput.value = '';
    this.secCapInput.value = '';
    this.secSchedInput.value = '';
  }

  renderTempSections() {
    this.sectionsListUl.innerHTML = '';
    this.tempSections.forEach((sec, index) => {
      const li = document.createElement('li');
      li.className = 'section-item';

      li.innerHTML = `
        <span><b>${sec.name}</b> (${sec.category}) - ${sec.capacity} pers.</span>
        <button type="button" class="auth-nav-btn btn-remove">&times;</button>
      `;

      li.querySelector('button').addEventListener('click', () => {
        this.tempSections.splice(index, 1);
        this.renderTempSections();
      });
      this.sectionsListUl.appendChild(li);
    });
  }

  async handleAddGym(e) {
    e.preventDefault();
    this.statusMessage.textContent = 'Creating...';
    this.statusMessage.className = 'status-message';

    try {
      const builder = new GymBuilder();
      builder
        .setBasicInfo(
          document.querySelector('.gym-name').value,
          document.querySelector('.gym-address').value,
          document.querySelector('.gym-desc').value,
          document.querySelector('.gym-one-time-price').value,
          document.querySelector('.gym-monthly-price').value
        )
        .setImage(this.imageInput.value);

      this.tempSections.forEach((sec) => {
        builder.addSection(sec.name, sec.category, sec.capacity, sec.schedule);
      });

      const gymPayload = builder.build();
      await ApiService.post('/gyms', gymPayload);

      UI.toast('Gym created successfully!', 'success');
      this.statusMessage.textContent = '';

      this.gymForm.reset();
      this.tempSections = [];
      this.renderTempSections();
      this.loadGyms();
    } catch (error) {
      console.error(error);
      UI.toast(error.message, 'error');
    }
  }

  async loadGyms() {
    try {
      const gyms = await ApiService.get('/gyms');
      this.renderGymList(gyms);
    } catch (error) {
      console.error(error);
      this.gymListContainer.innerHTML =
        '<p class="status-error">Failed to load gyms</p>';
    }
  }

  renderGymList(gyms) {
    this.gymListContainer.innerHTML = '';
    if (!gyms || gyms.length === 0) {
      this.gymListContainer.innerHTML = '<p>No gyms found.</p>';
      return;
    }

    gyms.forEach((gym) => {
      const sectionsCount = gym.sections ? gym.sections.length : 0;
      const priceDisplay = gym.oneTimePrice ? `$${gym.oneTimePrice}` : 'N/A';

      const item = document.createElement('div');
      item.className = 'admin-gym-item';

      item.innerHTML = `
            <div class="admin-gym-info">
                <h4>${gym.name}</h4>
                <p>${gym.address} | Base Price: ${priceDisplay}</p>
                <p class="card-subtext">Sections: ${sectionsCount}</p>
            </div>
            <button class="btn-text-danger btn-delete-gym" data-id="${gym._id}">
              Delete
            </button>
      `;

      const deleteBtn = item.querySelector('.btn-delete-gym');
      deleteBtn.addEventListener('click', async () => {
        const confirmed = await UI.confirm(`Delete "${gym.name}"?`);
        if (!confirmed) return;

        try {
          await ApiService.delete(`/gyms/${gym._id}`);
          UI.toast('Gym deleted', 'success');
          this.loadGyms();
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });

      this.gymListContainer.appendChild(item);
    });
  }

  async loadAllBookings() {
    if (!this.bookingsContainer) return;
    try {
      const bookings = await ApiService.get('/bookings/all');
      this.renderBookings(bookings);
    } catch (error) {
      console.error(error);
      this.bookingsContainer.innerHTML =
        '<p class="status-error">Failed to load bookings</p>';
    }
  }

  renderBookings(bookings) {
    this.bookingsContainer.innerHTML = '';

    if (!bookings || bookings.length === 0) {
      this.bookingsContainer.innerHTML =
        '<p class="text-center">No active bookings found.</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'admin-table';

    table.innerHTML = `
      <thead>
        <tr>
          <th>User</th>
          <th>Gym / Section</th>
          <th>Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    bookings.forEach((booking) => {
      const tr = document.createElement('tr');

      const userName = booking.user ? booking.user.name : 'Unknown User';
      const userEmail = booking.user ? booking.user.email : '';
      const gymName = booking.gym ? booking.gym.name : 'Unknown Gym';

      let statusColorClass = 'status-success';
      if (booking.status === 'cancelled') statusColorClass = 'status-error';

      const cancelBtn =
        booking.status === 'active'
          ? `<button class="btn-text-danger btn-cancel-booking" data-id="${booking._id}">Cancel</button>`
          : '-';

      tr.innerHTML = `
        <td>
          <strong>${userName}</strong><br>
          <small>${userEmail}</small>
        </td>
        <td>
          ${gymName}<br>
          <small>${booking.sectionName} (${booking.sectionCategory})</small>
        </td>
        <td>
          ${booking.bookingDate}<br>
          ${booking.timeSlot}
        </td>
        <td class="${statusColorClass}">
          ${booking.status.toUpperCase()}
        </td>
        <td>
          ${cancelBtn}
        </td>
      `;

      const btn = tr.querySelector('.btn-cancel-booking');
      if (btn) {
        btn.addEventListener('click', () =>
          this.handleCancelBooking(booking._id)
        );
      }

      tbody.appendChild(tr);
    });

    this.bookingsContainer.appendChild(table);
  }

  async handleCancelBooking(bookingId) {
    const confirmed = await UI.confirm('Cancel this user booking?');
    if (!confirmed) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await ApiService.patch(`/bookings/${bookingId}/cancel`, {
        userId: user.id,
        role: user.role,
      });

      UI.toast('Booking cancelled. Notification sent.', 'success');
      this.loadAllBookings();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  async loadReports() {
    this.reportOutput.innerHTML =
      '<p class="text-center">Calculating stats...</p>';

    try {
      const stats = await ApiService.get('/reports/gym-stats');
      this.renderReportTable(stats);
    } catch (error) {
      this.reportOutput.innerHTML =
        '<p class="status-error text-center">Failed to load report.</p>';
    }
  }

  renderReportTable(stats) {
    if (!stats || stats.length === 0) {
      this.reportOutput.innerHTML =
        '<p class="text-center">No data available yet.</p>';
      return;
    }

    stats.sort((a, b) => b.totalRevenue - a.totalRevenue);

    let html = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Gym Name</th>
            <th>Total Bookings</th>
            <th>Revenue ($)</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalSystemRevenue = 0;

    stats.forEach((item) => {
      totalSystemRevenue += item.totalRevenue;
      html += `
        <tr>
          <td><strong>${item.gymName}</strong></td>
          <td>${item.totalBookings} visits</td>
          <td class="revenue-text">$${item.totalRevenue}</td>
        </tr>
      `;
    });

    html += `
        <tr class="total-row">
          <td class="total-label">TOTAL SYSTEM:</td>
          <td>-</td>
          <td class="total-sum">$${totalSystemRevenue}</td>
        </tr>
      </tbody>
      </table>
    `;

    this.reportOutput.innerHTML = html;
  }
}

new AdminManager();
