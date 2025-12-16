'use strict';

import ApiService from '../api/api.js';
import UI from '../ui.js';

export default class BookingModal {
  constructor(updateUserHeaderCallback) {
    this.updateUserHeader = updateUserHeaderCallback;

    this.modal = document.querySelector('.booking-modal');
    this.closeBtn = document.querySelector('.close-modal');
    this.form = document.querySelector('.booking-form');

    this.gymNameEl = document.querySelector('.modal-gym-name');
    this.gymIdEl = document.querySelector('.modal-gym-id');
    this.sectionSelect = document.querySelector('.input-section');
    this.dateInput = document.querySelector('.input-date');
    this.timeSelect = document.querySelector('.input-time');

    this.bonusCheckbox = document.querySelector('.input-bonus');
    this.bonusHint = document.querySelector('.bonus-hint');

    this.init();
  }

  init() {
    if (this.closeBtn)
      this.closeBtn.addEventListener('click', () => this.close());

    window.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  open(gym) {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      UI.toast('Please log in first', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
      return;
    }
    const user = JSON.parse(userStr);

    this.gymNameEl.textContent = `Booking: ${gym.name}`;
    this.gymIdEl.value = gym._id;
    this.sectionSelect.innerHTML = '';

    if (gym.sections && gym.sections.length > 0) {
      gym.sections.forEach((sec) => {
        const option = document.createElement('option');
        option.value = `${sec.name}|${sec.category}`;
        option.textContent = `${sec.name} (${sec.category}) - ${sec.schedule}`;
        this.sectionSelect.appendChild(option);
      });
    } else {
      const option = document.createElement('option');
      option.textContent = 'No sections available';
      this.sectionSelect.appendChild(option);
    }

    this._setupBonusUI(user);
    this.modal.classList.remove('hidden');
  }

  close() {
    this.modal.classList.add('hidden');
  }

  _setupBonusUI(user) {
    const userPoints = user.bonusPoints || 0;
    const PRICE_IN_POINTS = 100;

    if (!this.bonusCheckbox || !this.bonusHint) return;

    this.bonusCheckbox.checked = false;

    if (userPoints >= PRICE_IN_POINTS) {
      this.bonusCheckbox.disabled = false;
      this.bonusHint.textContent = `Available: ${userPoints} pts`;
      this.bonusHint.className = 'bonus-hint sufficient';
    } else {
      this.bonusCheckbox.disabled = true;
      this.bonusHint.textContent = `Need ${PRICE_IN_POINTS} pts (You: ${userPoints})`;
      this.bonusHint.className = 'bonus-hint insufficient';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));

    const [sectionName, sectionCategory] = this.sectionSelect.value.split('|');

    if (!sectionName) {
      UI.toast('Error: No section selected!', 'error');
      return;
    }

    const paymentMethod = this.bonusCheckbox.checked ? 'bonuses' : 'money';

    const selectedDate = new Date(this.dateInput.value);
    const dateNow = new Date();
    dateNow.setHours(0, 0, 0, 0);

    if (selectedDate < dateNow) {
      UI.toast('Error: Invalid date!', 'error');
      return;
    }

    const bookingData = {
      userId: user.id,
      gymId: this.gymIdEl.value,
      sectionName,
      sectionCategory,
      bookingDate: this.dateInput.value,
      timeSlot: this.timeSelect.value,
      membershipType: 'standard',
      paymentMethod: paymentMethod,
    };

    try {
      const result = await ApiService.post('/bookings', bookingData);

      UI.toast(result.message, 'success');

      if (result.newBonusBalance !== undefined) {
        user.bonusPoints = result.newBonusBalance;
        localStorage.setItem('user', JSON.stringify(user));
        if (this.updateUserHeader) this.updateUserHeader(user);
      }

      this.close();
    } catch (err) {
      UI.toast(`Booking Failed: ${err.message}`, 'error');
    }
  }
}
