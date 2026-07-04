'use strict';

const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(protect);

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Retrieve list of staff members
 *     tags: [Staff]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *         description: Filter staff by role
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: List of staff retrieved successfully
 *   post:
 *     summary: Add a new staff member profile
 *     tags: [Staff]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password, firstName, lastName, role]
 *             properties:
 *               email: { type: string, example: 'doctor1@mediflow.com' }
 *               username: { type: string, example: 'doctor1' }
 *               password: { type: string, example: 'password123' }
 *               firstName: { type: string, example: 'John' }
 *               lastName: { type: string, example: 'Doe' }
 *               role: { type: string, enum: [DOCTOR, RECEPTIONIST, PHARMACIST, LAB_TECH], example: 'DOCTOR' }
 *               phone: { type: string }
 *               department: { type: string, description: 'Department ID' }
 *               branch: { type: string, description: 'Branch ID' }
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *       403:
 *         description: Forbidden — admin privileges required
 */
router.get('/', staffController.getStaffList);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     summary: Retrieve staff details by ID
 *     tags: [Staff]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Staff details retrieved
 *       404:
 *         description: Staff member not found
 *   put:
 *     summary: Update staff profile details
 *     tags: [Staff]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               isActive: { type: boolean }
 *               department: { type: string }
 *               branch: { type: string }
 *     responses:
 *       200:
 *         description: Staff profile updated successfully
 *       403:
 *         description: Forbidden — admin privileges required
 */
router.get('/:id', staffController.getStaffDetails);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), staffController.createStaff);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), staffController.updateStaffProfile);

module.exports = router;
