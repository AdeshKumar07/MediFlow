const LabTest = require('../models/labTest.model');

class LaboratoryRepository {
  async getLabTests(query = {}, skip = 0, limit = 10) {
    return await LabTest.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async countLabTests(query = {}) {
    return await LabTest.countDocuments(query);
  }

  async getLabTestById(id) {
    return await LabTest.findById(id)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName');
  }

  async createLabTest(data) {
    return await LabTest.create(data);
  }

  async updateLabTest(id, data) {
    return await LabTest.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName');
  }

  async deleteLabTest(id) {
    return await LabTest.findByIdAndDelete(id);
  }
}

module.exports = new LaboratoryRepository();
