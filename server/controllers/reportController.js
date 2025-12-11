'use strict';

const ReportService = require('../services/reportService');

class ReportController {
  async getGymReports(req, res) {
    try {
      const data = await ReportService.getGymStats();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error generating reports' });
    }
  }
}

module.exports = new ReportController();
