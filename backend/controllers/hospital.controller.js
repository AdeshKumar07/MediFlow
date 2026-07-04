const hospitalService = require('../services/hospital.service');
const ApiError = require('../utils/apiError');

class HospitalController {
  async getHospitalProfile(req, res, next) {
    try {
      const hospital = await hospitalService.getHospitalProfile();
      res.status(200).json({ success: true, data: hospital });
    } catch (error) { next(error); }
  }

  async updateHospitalProfile(req, res, next) {
    try {
      const hospital = await hospitalService.updateHospitalProfile(req.body);
      res.status(200).json({ success: true, data: hospital });
    } catch (error) { next(error); }
  }

  async getBranches(req, res, next) {
    try {
      const { page, limit, search, isActive } = req.query;
      const query = {};
      if (search) query.name = { $regex: search, $options: 'i' };
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      const data = await hospitalService.getBranches(query, page, limit);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createBranch(req, res, next) {
    try {
      const branch = await hospitalService.createBranch(req.body);
      res.status(201).json({ success: true, data: branch });
    } catch (error) { next(error); }
  }

  async updateBranch(req, res, next) {
    try {
      const branch = await hospitalService.updateBranch(req.params.id, req.body);
      if (!branch) throw new ApiError(404, 'Branch not found');
      res.status(200).json({ success: true, data: branch });
    } catch (error) { next(error); }
  }

  async getDepartments(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const query = {};
      if (search) query.name = { $regex: search, $options: 'i' };
      const data = await hospitalService.getDepartments(query, page, limit);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createDepartment(req, res, next) {
    try {
      const dept = await hospitalService.createDepartment(req.body);
      res.status(201).json({ success: true, data: dept });
    } catch (error) { next(error); }
  }

  async updateDepartment(req, res, next) {
    try {
      const dept = await hospitalService.updateDepartment(req.params.id, req.body);
      if (!dept) throw new ApiError(404, 'Department not found');
      res.status(200).json({ success: true, data: dept });
    } catch (error) { next(error); }
  }
}

module.exports = new HospitalController();
