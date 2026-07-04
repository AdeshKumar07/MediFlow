const Announcement = require('../models/announcement.model');
const ApiError = require('../utils/apiError');

const HIERARCHY = {
  SUPER_ADMIN: ['ALL', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECH', 'PATIENT'],
  HOSPITAL_ADMIN: ['ALL', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECH', 'PATIENT'],
  DOCTOR: ['NURSE', 'PATIENT'],
  NURSE: ['PATIENT'],
  RECEPTIONIST: ['PATIENT'],
  PHARMACIST: ['PATIENT'],
  LAB_TECH: ['PATIENT'],
  PATIENT: []
};

class AnnouncementService {
  async createAnnouncement(sender, announcementData) {
    const { title, content, targetRole } = announcementData;
    
    // Check hierarchy permissions
    const allowedTargets = HIERARCHY[sender.role] || [];
    if (!allowedTargets.includes(targetRole)) {
      throw new ApiError(403, `Your role (${sender.role}) is not authorized to create announcements for target: ${targetRole}`);
    }

    const announcement = await Announcement.create({
      title,
      content,
      targetRole,
      senderId: sender._id
    });

    return await announcement.populate('senderId', 'firstName lastName role');
  }

  async getMyAnnouncements(user) {
    // Announcements are visible if targeted to 'ALL', or if targeted specifically to the user's role
    // Or if the announcement was created by the user themselves
    return await Announcement.find({
      $or: [
        { targetRole: 'ALL' },
        { targetRole: user.role },
        { senderId: user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('senderId', 'firstName lastName role');
  }

  async deleteAnnouncement(announcementId, user) {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      throw new ApiError(404, 'Announcement not found');
    }

    // Only the sender or a SUPER_ADMIN can delete
    if (announcement.senderId.toString() !== user._id.toString() && user.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Not authorized to delete this announcement');
    }

    await announcement.deleteOne();
    return { success: true };
  }
}

module.exports = new AnnouncementService();
module.exports.HIERARCHY = HIERARCHY;
