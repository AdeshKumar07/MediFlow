'use strict';

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(protect);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: List all patients
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
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
 *         description: Paginated patient list
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Patient registered
 *       403:
 *         description: Insufficient role (Receptionist/Admin only)
 */
router.get('/', patientController.getPatientList);
router.post('/',
  authorize(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  patientController.registerPatient
);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient profile by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient profile
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
 *                         user:    { $ref: '#/components/schemas/User' }
 *                         profile: { $ref: '#/components/schemas/PatientProfile' }
 *       404:
 *         description: Patient not found
 *   put:
 *     summary: Update patient profile
 *     tags: [Patients]
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
 *             $ref: '#/components/schemas/PatientProfile'
 *     responses:
 *       200:
 *         description: Profile updated
 *   delete:
 *     summary: Delete patient (Admin only)
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient deleted
 *       403:
 *         description: Admin only
 */
router.get('/:id',    patientController.getPatientDetails);
router.put('/:id',
  authorize(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  patientController.updatePatientProfile
);
router.delete('/:id',
  authorize(ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  patientController.deletePatient
);

module.exports = router;
