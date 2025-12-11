'use strict';

const Booking = require('../models/Booking');

class ReportService {
  constructor() {
    if (ReportService.instance) {
      return ReportService.instance;
    }
    ReportService.instance = this;
  }

  async getGymStats() {
    const stats = await Booking.aggregate([
      {
        $match: { status: { $ne: 'cancelled' } },
      },
      {
        $group: {
          _id: '$gym',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      {
        $lookup: {
          from: 'gyms',
          localField: '_id',
          foreignField: '_id',
          as: 'gymInfo',
        },
      },
      {
        $unwind: '$gymInfo',
      },
      {
        $project: {
          gymName: '$gymInfo.name',
          totalBookings: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return stats;
  }
}

module.exports = new ReportService();
