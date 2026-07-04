const availabilityRepository = require('../repositories/availability.repository');

class AvailabilityService {
  async setAvailability(doctorId, branchId, schedules) {
    // schedules is an array of objects: { dayOfWeek, slots, slotDuration }
    const results = [];
    
    for (const schedule of schedules) {
      const query = { doctorId, branchId, dayOfWeek: schedule.dayOfWeek };
      const data = {
        doctorId,
        branchId,
        dayOfWeek: schedule.dayOfWeek,
        slots: schedule.slots,
        slotDuration: schedule.slotDuration || 30
      };
      
      const result = await availabilityRepository.createOrUpdateAvailability(query, data);
      results.push(result);
    }
    
    return results;
  }

  async getAvailabilities(filters) {
    const { doctorId, branchId, dayOfWeek } = filters;
    const query = {};
    
    if (doctorId) query.doctorId = doctorId;
    if (branchId) query.branchId = branchId;
    if (dayOfWeek !== undefined) query.dayOfWeek = dayOfWeek;
    
    return await availabilityRepository.getAvailabilities(query);
  }
  
  async getAvailabilityByDoctorAndDay(doctorId, branchId, dayOfWeek) {
    return await availabilityRepository.getAvailabilityByDoctorAndDay(doctorId, branchId, dayOfWeek);
  }
}

module.exports = new AvailabilityService();
