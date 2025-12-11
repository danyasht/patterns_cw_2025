'use strict';

export default class GymBuilder {
  constructor() {
    this.gym = {
      name: '',
      address: '',
      description: '',
      image: '',
      oneTimePrice: 0,
      monthlyPrice: 0,
      sections: [],
    };
  }

  setBasicInfo(name, address, description, oneTimePrice, monthlyPrice) {
    this.gym.name = name;
    this.gym.address = address;
    this.gym.description = description;
    this.gym.oneTimePrice = Number(oneTimePrice);
    this.gym.monthlyPrice = Number(monthlyPrice);
    return this;
  }

  setImage(url) {
    if (url) this.gym.image = url;
    return this;
  }

  addSection(name, category, capacity, schedule) {
    this.gym.sections.push({
      name,
      category,
      capacity: Number(capacity),
      schedule,
    });
    return this;
  }

  build() {
    if (this.gym.sections.length === 0)
      throw new Error('Add at least one section!');
    return this.gym;
  }
}
