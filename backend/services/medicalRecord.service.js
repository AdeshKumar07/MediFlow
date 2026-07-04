const medicalRecordRepository = require('../repositories/medicalRecord.repository');
const ApiError = require('../utils/apiError');

class MedicalRecordService {
  async createMedicalRecord(data) {
    return await medicalRecordRepository.createRecord(data);
  }

  async getMedicalRecords(filters, pagination) {
    const { patientId, doctorId } = filters;
    const { page = 1, limit = 10 } = pagination;
    
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    const skip = (page - 1) * limit;
    
    const records = await medicalRecordRepository.getRecords(query, skip, limit);
    const total = await medicalRecordRepository.countRecords(query);

    return {
      records,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    };
  }

  async getMedicalRecordById(id) {
    const record = await medicalRecordRepository.getRecordById(id);
    if (!record) {
      throw new ApiError(404, 'Medical record not found');
    }
    return record;
  }

  async updateMedicalRecord(id, data) {
    const record = await medicalRecordRepository.updateRecord(id, data);
    if (!record) {
      throw new ApiError(404, 'Medical record not found');
    }
    return record;
  }
}

module.exports = new MedicalRecordService();
