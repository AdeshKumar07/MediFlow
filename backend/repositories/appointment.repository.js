const Appointment = require('../models/appointment.model');

class AppointmentRepository {
  async createAppointment(data) {
    return await Appointment.create(data);
  }

  async getAppointments(query = {}, skip = 0, limit = 10, sort = { date: -1 }) {
    return await Appointment.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email')
      .populate('branchId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countAppointments(query = {}) {
    return await Appointment.countDocuments(query);
  }

  async getAppointmentById(id) {
    return await Appointment.findById(id)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email')
      .populate('branchId', 'name');
  }

  async updateAppointment(id, data) {
    return await Appointment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteAppointment(id) {
    return await Appointment.findByIdAndDelete(id);
  }
}

module.exports = new AppointmentRepository();
