const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(protect);

// Only doctors can create and update EMRs
router.post('/', authorize(ROLES.DOCTOR), medicalRecordController.createMedicalRecord);
router.put('/:id', authorize(ROLES.DOCTOR), medicalRecordController.updateMedicalRecord);

// Anyone involved (Patient, Doctor, Nurse, Admin) can view
router.get('/', medicalRecordController.getMedicalRecords);
router.get('/:id', medicalRecordController.getMedicalRecordById);

module.exports = router;
