'use strict';

const GymService = require('../services/gymService');

class GymController {
  getAllGyms = async (req, res) => {
    try {
      const { search, categories, ageGroup } = req.query;
      const gyms = await GymService.getAllGyms(search, categories, ageGroup);
      res.json(gyms);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching gyms' });
    }
  };

  createGym = async (req, res) => {
    try {
      const newGym = await GymService.createGym(req.body);
      res.status(201).json(newGym);
    } catch (err) {
      console.error(err);
      res
        .status(400)
        .json({ message: 'Error creating gym', error: err.message });
    }
  };

  deleteGym = async (req, res) => {
    try {
      await GymService.deleteGym(req.params.id);
      res.json({ message: 'Gym deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting gym' });
    }
  };
}

module.exports = new GymController();
