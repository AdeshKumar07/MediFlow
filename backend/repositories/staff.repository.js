const StaffProfile = require('../models/staffProfile.model');
const User = require('../models/user.model');

class StaffRepository {
  async getStaffWithProfiles(userQuery = {}, skip = 0, limit = 10, specialization = null) {
    let profileQuery = {};
    if (specialization) {
      profileQuery.specialization = { $regex: specialization, $options: 'i' };
    }
    
    // If we have profile filters, get matching userIds first
    if (Object.keys(profileQuery).length > 0) {
      const matchingProfiles = await StaffProfile.find(profileQuery).select('userId');
      const userIds = matchingProfiles.map(p => p.userId);
      userQuery._id = { $in: userIds };
    }

    const total = await User.countDocuments(userQuery);
    const users = await User.find(userQuery).skip(skip).limit(limit).select('-password -__v').lean();

    // Attach profiles
    const userIds = users.map(u => u._id);
    const profiles = await StaffProfile.find({ userId: { $in: userIds } }).populate('departmentId', 'name').lean();

    const staff = users.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString()) || {};
      return { ...user, profile };
    });

    return { staff, total };
  }

  async getStaffProfileByUserId(userId) {
    return await StaffProfile.findOne({ userId })
      .populate('departmentId', 'name')
      .populate('branchId', 'name');
  }

  async createStaffProfile(data) {
    return await StaffProfile.create(data);
  }

  async updateStaffProfileByUserId(userId, data) {
    return await StaffProfile.findOneAndUpdate({ userId }, data, { new: true, upsert: true });
  }
}

module.exports = new StaffRepository();
