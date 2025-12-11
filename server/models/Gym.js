'use strict';

const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  schedule: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['gym', 'yoga', 'pool', 'boxing', 'stretching'],
    required: true,
  },
});

const gymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=500&q=80',
  },
  address: { type: String, required: true },
  description: { type: String },

  oneTimePrice: {
    type: Number,
    required: true,
  },
  monthlyPrice: {
    type: Number,
    required: true,
  },

  sections: [sectionSchema],
  categoriesTags: {
    type: [String],
  },
});

module.exports = mongoose.model('Gym', gymSchema);
