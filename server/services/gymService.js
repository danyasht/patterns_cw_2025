'use strict';

const Gym = require('../models/Gym');

class GymService {
  async getAllGyms(searchText, category, ageGroup) {
    let filter = {};

    if (searchText) {
      filter.name = { $regex: searchText, $options: 'i' };
    }

    if (category) {
      filter['sections.category'] = category;
    }

    if (ageGroup === 'kids') {
      filter['sections.category'] = { $in: ['pool', 'yoga', 'stretching'] };
    } else if (ageGroup === 'adults') {
      filter['sections.category'] = { $in: ['boxing', 'gym'] };
    }

    return await Gym.find(filter);
  }

  async createGym(gymData) {
    if (gymData.oneTimePrice < 0 || gymData.monthlyPrice < 0) {
      throw new Error('Price cannot be negative');
    }

    const newGym = new Gym(gymData);
    return await newGym.save();
  }

  async deleteGym(id) {
    return await Gym.findByIdAndDelete(id);
  }
}

module.exports = new GymService();
