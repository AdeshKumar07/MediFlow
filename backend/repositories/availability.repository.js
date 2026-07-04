const Availability = require('../models/availability.model');

class AvailabilityRepository {
  async createOrUpdateAvailability(query, data) {
    return await Availability.findOneAndUpdate(query, data, { new: true, upsert: true, runValidators: true });
  }

  async getAvailabilities(query = {}) {
    return await Availability.find(query)
      .populate('doctorId', 'firstName lastName email')
      .populate('branchId', 'name')
      .sort({ dayOfWeek: 1 });
  }

  async getAvailabilityByDoctorAndDay(doctorId, branchId, dayOfWeek) {
    return await Availability.findOne({ doctorId, branchId, dayOfWeek });
  }

  async deleteAvailability(id) {
    return await Availability.findByIdAndDelete(id);
  }
}

module.exports = new AvailabilityRepository();
