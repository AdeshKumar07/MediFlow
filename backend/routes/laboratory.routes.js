'use strict';

const express = require('express');
const router = express.Router();
const laboratoryController = require('../controllers/laboratory.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');
const upload = require('../middlewares/upload.middleware');
const { createLabTestValidator, updateLabTestValidator } = require('../validators/laboratory.validator');

router.use(protect);

/**
 * @swagger
 * /api/laboratory:
 *   get:
 *     summary: List lab tests (role-filtered)
 *     tags: [Laboratory]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated lab tests
 *   post:
 *     summary: Create a new lab test order
 *     tags: [Laboratory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabTest'
 *     responses:
 *       201:
 *         description: Lab test created
 *       403:
 *         description: Doctor/Admin only
 */
router.get('/',
  authorize(ROLES.LAB_TECH, ROLES.DOCTOR, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  laboratoryController.getLabTests
);
router.post('/',
  authorize(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  createLabTestValidator,
  laboratoryController.createLabTest
);

/**
 * @swagger
 * /api/laboratory/{id}:
 *   get:
 *     summary: Get lab test by ID
 *     tags: [Laboratory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab test details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         labTest:
 *                           $ref: '#/components/schemas/LabTest'
 *       404:
 *         description: Lab test not found
 *   put:
 *     summary: Update lab test results/status
 *     tags: [Laboratory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabTest'
 *     responses:
 *       200:
 *         description: Lab test updated
 *   delete:
 *     summary: Delete lab test (Admin only)
 *     tags: [Laboratory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab test deleted
 */
router.get('/:id',
  authorize(ROLES.LAB_TECH, ROLES.DOCTOR, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  laboratoryController.getLabTestById
);
router.put('/:id',
  authorize(ROLES.LAB_TECH, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  updateLabTestValidator,
  laboratoryController.updateLabTest
);
router.delete('/:id',
  authorize(ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  laboratoryController.deleteLabTest
);

/**
 * @swagger
 * /api/laboratory/{id}/pdf:
 *   get:
 *     summary: Download lab test report as PDF
 *     tags: [Laboratory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF report stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Report not found
 */
router.get('/:id/pdf',
  authorize(ROLES.LAB_TECH, ROLES.DOCTOR, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  laboratoryController.generatePdfReport
);

/**
 * @swagger
 * /api/laboratory/{id}/upload:
 *   post:
 *     summary: Upload PDF report file for a lab test
 *     tags: [Laboratory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [report]
 *             properties:
 *               report:
 *                 type: string
 *                 format: binary
 *                 description: PDF report file (max 10 MB)
 *     responses:
 *       200:
 *         description: Report uploaded
 *       400:
 *         description: Invalid file or file too large
 */
router.post('/:id/upload',
  authorize(ROLES.LAB_TECH, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  upload.single('report'),
  laboratoryController.uploadReport
);

module.exports = router;
