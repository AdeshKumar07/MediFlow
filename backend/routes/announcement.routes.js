const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Create an announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - targetRole
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               targetRole:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       403:
 *         description: Forbidden
 */
router.post('/', announcementController.createAnnouncement);

/**
 * @swagger
 * /api/announcements:
 *   get:
 *     summary: Get all announcements visible to user
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', announcementController.getMyAnnouncements);

/**
 * @swagger
 * /api/announcements/{id}:
 *   delete:
 *     summary: Delete an announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
