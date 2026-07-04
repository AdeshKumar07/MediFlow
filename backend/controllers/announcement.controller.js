const announcementService = require('../services/announcement.service');

class AnnouncementController {
  async createAnnouncement(req, res, next) {
    try {
      const data = await announcementService.createAnnouncement(req.user, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMyAnnouncements(req, res, next) {
    try {
      const data = await announcementService.getMyAnnouncements(req.user);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncement(req, res, next) {
    try {
      const data = await announcementService.deleteAnnouncement(req.params.id, req.user);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnnouncementController();
