'use strict';

export default class UI {
  static toast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  static confirm(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';

      overlay.innerHTML = `
        <div class="confirm-box">
          <h3>Confirm Action</h3>
          <p class="confirm-text">${message}</p>
          
          <div class="confirm-actions">
            <button class="btn-confirm-no">Cancel</button>
            <button class="btn-confirm-yes">Confirm</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const btnYes = overlay.querySelector('.btn-confirm-yes');
      const btnNo = overlay.querySelector('.btn-confirm-no');

      const close = (result) => {
        overlay.remove();
        resolve(result);
      };

      btnYes.addEventListener('click', () => close(true));
      btnNo.addEventListener('click', () => close(false));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(false);
      });
    });
  }
}
