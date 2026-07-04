const Medicine = require('../models/medicine.model');
const MedicalRecord = require('../models/medicalRecord.model');

class PharmacyRepository {
  async getMedicines(query = {}, skip = 0, limit = 10) {
    return await Medicine.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
  }

  async countMedicines(query = {}) {
    return await Medicine.countDocuments(query);
  }

  async getMedicineById(id) {
    return await Medicine.findById(id);
  }

  async createMedicine(data) {
    return await Medicine.create(data);
  }

  async updateMedicine(id, data) {
    return await Medicine.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteMedicine(id) {
    return await Medicine.findByIdAndDelete(id);
  }

  async getMedicineByName(name) {
    return await Medicine.findOne({ name: { $regex: new RegExp("^" + name + "$", "i") } });
  }

  async getPrescriptions(query = {}, skip = 0, limit = 10) {
    return await MedicalRecord.find({ medicines: { $exists: true, $not: { $size: 0 } }, ...query })
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async countPrescriptions(query = {}) {
    return await MedicalRecord.countDocuments({ medicines: { $exists: true, $not: { $size: 0 } }, ...query });
  }

  async getPrescriptionById(id) {
    return await MedicalRecord.findById(id)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName');
  }
}

module.exports = new PharmacyRepository();
