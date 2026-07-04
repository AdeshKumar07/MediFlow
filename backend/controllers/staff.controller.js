const staffService = require('../services/staff.service');
const ApiError = require('../utils/apiError');

class StaffController {
  async getStaffList(req, res, next) {
    try {
      const { page, limit, search, role, specialization, isActive } = req.query;
      const query = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) query.role = role;
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      // Note: specialization filtering will be handled by the service/repository since it's on StaffProfile

      const data = await staffService.getStaffList(query, page, limit, specialization);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getStaffDetails(req, res, next) {
    try {
      const data = await staffService.getStaffDetails(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createStaff(req, res, next) {
    try {
      const { userData, profileData } = req.body;
      const data = await staffService.createStaff(userData, profileData);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateStaffProfile(req, res, next) {
    try {
      const data = await staffService.updateStaffProfile(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }
}

module.exports = new StaffController();
