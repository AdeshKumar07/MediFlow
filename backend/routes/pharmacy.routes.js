'use strict';

const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');
const { medicineValidator } = require('../validators/pharmacy.validator');

router.use(protect);

/**
 * @swagger
 * /api/pharmacy/prescriptions:
 *   get:
 *     summary: List prescriptions (filtered by role)
 *     tags: [Pharmacy]
 *     parameters:
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
 *         description: Paginated prescriptions list
 */
router.get('/prescriptions',
  authorize(ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  pharmacyController.getPrescriptions
);

/**
 * @swagger
 * /api/pharmacy/dispense/{recordId}/{medicineId}:
 *   post:
 *     summary: Dispense a medicine from a prescription
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Medical record ID
 *       - in: path
 *         name: medicineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID to dispense
 *     responses:
 *       200:
 *         description: Medicine dispensed
 *       403:
 *         description: Pharmacist/Admin only
 */
router.post('/dispense/:recordId/:medicineId',
  authorize(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  pharmacyController.dispenseMedicine
);

/**
 * @swagger
 * /api/pharmacy:
 *   get:
 *     summary: List medicines inventory
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filter to show only low-stock medicines
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
 *         description: Paginated medicine list
 *   post:
 *     summary: Add a new medicine to inventory
 *     tags: [Pharmacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medicine'
 *     responses:
 *       201:
 *         description: Medicine created
 *       403:
 *         description: Pharmacist/Admin only
 */
router.get('/',
  authorize(ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  pharmacyController.getMedicines
);
router.post('/',
  authorize(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  medicineValidator,
  pharmacyController.createMedicine
);

/**
 * @swagger
 * /api/pharmacy/{id}:
 *   get:
 *     summary: Get medicine by ID
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicine details
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
 *                         medicine:
 *                           $ref: '#/components/schemas/Medicine'
 *       404:
 *         description: Medicine not found
 *   put:
 *     summary: Update medicine
 *     tags: [Pharmacy]
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
 *             $ref: '#/components/schemas/Medicine'
 *     responses:
 *       200:
 *         description: Medicine updated
 *   delete:
 *     summary: Delete medicine (Pharmacist/Admin only)
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicine deleted
 */
router.get('/:id',
  authorize(ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  pharmacyController.getMedicineById
);
router.put('/:id',
  authorize(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  medicineValidator,
  pharmacyController.updateMedicine
);
router.delete('/:id',
  authorize(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  pharmacyController.deleteMedicine
);

module.exports = router;
