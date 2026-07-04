const Hospital = require('../models/hospital.model');
const Branch = require('../models/branch.model');
const Department = require('../models/department.model');
const HospitalImage = require('../models/hospitalImage.model');


class HospitalRepository {
  // Hospital
  async getHospitalProfile() {
    return await Hospital.findOne();
  }
  
  async createOrUpdateHospital(data) {
    const hospital = await Hospital.findOne();
    if (hospital) {
      return await Hospital.findByIdAndUpdate(hospital._id, data, { new: true });
    }
    return await Hospital.create(data);
  }

  // Branches
  async getBranches(query = {}, skip = 0, limit = 10) {
    return await Branch.find(query).skip(skip).limit(limit).populate('hospitalId', 'name');
  }

  async countBranches(query = {}) {
    return await Branch.countDocuments(query);
  }

  async createBranch(data) {
    return await Branch.create(data);
  }
  
  async updateBranch(id, data) {
    return await Branch.findByIdAndUpdate(id, data, { new: true });
  }

  // Departments
  async getDepartments(query = {}, skip = 0, limit = 10) {
    return await Department.find(query)
      .skip(skip)
      .limit(limit)
      .populate('branchId', 'name')
      .populate('headOfDepartment', 'firstName lastName');
  }

  async countDepartments(query = {}) {
    return await Department.countDocuments(query);
  }

  async createDepartment(data) {
    return await Department.create(data);
  }
  
  async updateDepartment(id, data) {
    return await Department.findByIdAndUpdate(id, data, { new: true });
  }

  // Hospital Images
  async getImages() {
    return await HospitalImage.find().sort({ createdAt: -1 }).populate('uploadedBy', 'firstName lastName role');
  }

  async createImage(data) {
    return await HospitalImage.create(data);
  }

  async findImageById(id) {
    return await HospitalImage.findById(id);
  }

  async deleteImage(id) {
    return await HospitalImage.findByIdAndDelete(id);
  }
}

module.exports = new HospitalRepository();
