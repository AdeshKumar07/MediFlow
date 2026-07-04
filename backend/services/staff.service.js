const staffRepository = require('../repositories/staff.repository');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const ROLES = require('../constants/roles');

class StaffService {
  async getStaffList(query, page = 1, limit = 10, specialization = null) {
    const skip = (page - 1) * parseInt(limit);
    // Ensure we only fetch staff roles
    const staffRoles = [ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LAB_TECH];
    query.role = query.role ? query.role : { $in: staffRoles };
    
    const { staff, total } = await staffRepository.getStaffWithProfiles(query, skip, parseInt(limit), specialization);
    return { staff, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  }

  async getStaffDetails(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new ApiError(404, 'Staff user not found');
    const profile = await staffRepository.getStaffProfileByUserId(userId);
    return { user, profile };
  }

  async createStaff(userData, profileData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new ApiError(400, 'Email already in use');
    
    const user = await User.create(userData); // Pre-save handles password hashing
    const profile = await staffRepository.createStaffProfile({ userId: user._id, ...profileData });
    return { user: { _id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName }, profile };
  }

  async updateStaffProfile(userId, data) {
    const { isActive, ...profileData } = data;
    
    // Extract user.isActive (which is on the User model) and save it
    if (isActive !== undefined) {
      await User.findByIdAndUpdate(userId, { isActive: isActive === true || isActive === 'true' });
    }
    
    return await staffRepository.updateStaffProfileByUserId(userId, profileData);
  }
}

module.exports = new StaffService();
