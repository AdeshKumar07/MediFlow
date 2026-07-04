const hospitalRepository = require('../repositories/hospital.repository');

class HospitalService {
  async getHospitalProfile() {
    return await hospitalRepository.getHospitalProfile();
  }

  async updateHospitalProfile(data) {
    return await hospitalRepository.createOrUpdateHospital(data);
  }

  async getBranches(query, page = 1, limit = 10) {
    const skip = (page - 1) * parseInt(limit);
    const branches = await hospitalRepository.getBranches(query, skip, parseInt(limit));
    const total = await hospitalRepository.countBranches(query);
    return { branches, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  }

  async createBranch(data) {
    return await hospitalRepository.createBranch(data);
  }

  async updateBranch(id, data) {
    return await hospitalRepository.updateBranch(id, data);
  }

  async getDepartments(query, page = 1, limit = 10) {
    const skip = (page - 1) * parseInt(limit);
    const departments = await hospitalRepository.getDepartments(query, skip, parseInt(limit));
    const total = await hospitalRepository.countDepartments(query);
    return { departments, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  }

  async createDepartment(data) {
    return await hospitalRepository.createDepartment(data);
  }

  async updateDepartment(id, data) {
    return await hospitalRepository.updateDepartment(id, data);
  }
}

module.exports = new HospitalService();
