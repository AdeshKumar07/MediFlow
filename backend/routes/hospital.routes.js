'use strict';

const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(protect);

// ════════════════════════════════════════════════════════════════════
//  Hospital Profile
// ════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/hospital:
 *   get:
 *     summary: Retrieve hospital profile details
 *     tags: [Hospital]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved hospital details
 *   put:
 *     summary: Update hospital profile
 *     tags: [Hospital]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: 'MediFlow Hospital' }
 *               email: { type: string, example: 'contact@mediflow.com' }
 *               phone: { type: string, example: '+919999999999' }
 *               website: { type: string, example: 'https://mediflow.com' }
 *               address: { type: string, example: 'New Delhi, India' }
 *     responses:
 *       200:
 *         description: Hospital profile updated successfully
 *       403:
 *         description: Forbidden — admin only
 */
router.get('/', hospitalController.getHospitalProfile);
router.put('/', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), hospitalController.updateHospitalProfile);

// ════════════════════════════════════════════════════════════════════
//  Branches
// ════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/hospital/branches:
 *   get:
 *     summary: Retrieve all branches
 *     tags: [Hospital]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of branches retrieved
 *   post:
 *     summary: Create a new branch
 *     tags: [Hospital]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, city]
 *             properties:
 *               name: { type: string, example: 'West Wing' }
 *               address: { type: string, example: 'Sector 5, Dwarka' }
 *               city: { type: string, example: 'New Delhi' }
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       403:
 *         description: Forbidden — Super Admin only
 */
router.get('/branches', hospitalController.getBranches);
router.post('/branches', authorize(ROLES.SUPER_ADMIN), hospitalController.createBranch);

/**
 * @swagger
 * /api/hospital/branches/{id}:
 *   put:
 *     summary: Update an existing branch
 *     tags: [Hospital]
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
 *               name: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *     responses:
 *       200:
 *         description: Branch updated successfully
 */
router.put('/branches/:id', authorize(ROLES.SUPER_ADMIN), hospitalController.updateBranch);

// ════════════════════════════════════════════════════════════════════
//  Departments
// ════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/hospital/departments:
 *   get:
 *     summary: Retrieve all departments
 *     tags: [Hospital]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments retrieved
 *   post:
 *     summary: Create a new department
 *     tags: [Hospital]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: 'Cardiology' }
 *               description: { type: string, example: 'Heart and vascular care' }
 *     responses:
 *       201:
 *         description: Department created
 */
router.get('/departments', hospitalController.getDepartments);
router.post('/departments', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), hospitalController.createDepartment);

/**
 * @swagger
 * /api/hospital/departments/{id}:
 *   put:
 *     summary: Update an existing department
 *     tags: [Hospital]
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
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Department updated successfully
 */
router.put('/departments/:id', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), hospitalController.updateDepartment);

module.exports = router;
