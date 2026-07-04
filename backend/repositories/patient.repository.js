const PatientProfile = require('../models/patientProfile.model');
const User = require('../models/user.model');
const ROLES = require('../constants/roles');

class PatientRepository {
  async getPatients(query = {}, skip = 0, limit = 10) {
    query.role = ROLES.PATIENT;
    return await User.find(query)
      .skip(skip)
      .limit(limit)
      .select('-password -__v');
  }

  async countPatients(query = {}) {
    query.role = ROLES.PATIENT;
    return await User.countDocuments(query);
  }

  async getPatientProfileByUserId(userId) {
    return await PatientProfile.findOne({ userId });
  }

  async createPatientProfile(data) {
    return await PatientProfile.create(data);
  }

  async updatePatientProfileByUserId(userId, data) {
    return await PatientProfile.findOneAndUpdate({ userId }, data, { new: true, upsert: true });
  }

  async deletePatientByUserId(userId) {
    await PatientProfile.findOneAndDelete({ userId });
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = new PatientRepository();
