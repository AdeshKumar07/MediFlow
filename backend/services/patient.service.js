const patientRepository = require('../repositories/patient.repository');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const ROLES = require('../constants/roles');

class PatientService {
  async getPatientList(query, page = 1, limit = 10) {
    const skip = (page - 1) * parseInt(limit);
    const patients = await patientRepository.getPatients(query, skip, parseInt(limit));
    const total = await patientRepository.countPatients(query);
    return { patients, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  }

  async getPatientDetails(userId) {
    const user = await User.findOne({ _id: userId, role: ROLES.PATIENT }).select('-password');
    if (!user) throw new ApiError(404, 'Patient not found');
    const profile = await patientRepository.getPatientProfileByUserId(userId);
    return { user, profile };
  }

  async registerPatient(userData, profileData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new ApiError(400, 'Email already in use');
    
    userData.role = ROLES.PATIENT;
    const user = await User.create(userData);
    const profile = await patientRepository.createPatientProfile({ userId: user._id, ...profileData });
    return { user: { _id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName }, profile };
  }

  async updatePatientProfile(userId, profileData) {
    return await patientRepository.updatePatientProfileByUserId(userId, profileData);
  }

  async deletePatient(userId) {
    const user = await User.findOne({ _id: userId, role: ROLES.PATIENT });
    if (!user) throw new ApiError(404, 'Patient not found');
    return await patientRepository.deletePatientByUserId(userId);
  }
}

module.exports = new PatientService();
