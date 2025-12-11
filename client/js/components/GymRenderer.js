'use strict';

export default class GymRenderer {
  static render(gyms, container) {
    container.innerHTML = '';

    if (!gyms || gyms.length === 0) {
      container.innerHTML = '<p class="text-center">No gyms found.</p>';
      return;
    }

    gyms.forEach((gym) => {
      const html = this._createCardHtml(gym);
      container.insertAdjacentHTML('beforeend', html);
    });
  }

  static _createCardHtml(gym) {
    const image =
      gym.image ||
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=500&q=80';

    const name = gym.name || 'Untitled Gym';
    const address = gym.address || 'No address provided';
    const oneTimePrice = gym.oneTimePrice || 0;
    const monthlyPrice = gym.monthlyPrice || 0;

    let sectionsHtml = '<span class="gym-tag">No sections</span>';

    if (gym.sections && gym.sections.length > 0) {
      sectionsHtml = gym.sections
        .map((s) => `<span class="gym-tag">${s.name}</span>`)
        .join('');
    }

    return `
      <div class="gym-card">
          <div class="gym-image-wrapper">
              <img src="${image}" alt="${name}" class="gym-image">
          </div>

          <div class="gym-card-content">
            <h3 class="gym-title">${name}</h3>
            
            <div class="gym-tags-container">
              ${sectionsHtml}
            </div>
            
            <p class="gym-info"><strong>📍 Address:</strong> ${address}</p>
            
            <div class="gym-card-footer">
                <p class="gym-price">
                   One-time: <strong>$${oneTimePrice}</strong>
                </p>
                
                <div class="gym-actions">
                    <button class="btn-book" data-id="${gym._id}">
                      Book Visit
                    </button>
                    
                    <button class="btn-subscribe" 
                        data-id="${gym._id}" 
                        data-name="${name}"
                        data-price="${monthlyPrice}">
                      Sub ($${monthlyPrice})
                    </button>
                </div>
            </div>
          </div>
      </div>
    `;
  }
}
