const MedicalRecord = require('../models/medicalRecord.model');

class MedicalRecordRepository {
  async createRecord(data) {
    return await MedicalRecord.create(data);
  }

  async getRecords(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await MedicalRecord.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'date timeSlot')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countRecords(query = {}) {
    return await MedicalRecord.countDocuments(query);
  }

  async getRecordById(id) {
    return await MedicalRecord.findById(id)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'date timeSlot reason');
  }

  async updateRecord(id, data) {
    return await MedicalRecord.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteRecord(id) {
    return await MedicalRecord.findByIdAndDelete(id);
  }
}

module.exports = new MedicalRecordRepository();
