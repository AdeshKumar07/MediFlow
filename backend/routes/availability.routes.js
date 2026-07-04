const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(protect);

// Anyone can view availabilities
router.get('/', availabilityController.getAvailabilities);

// Doctors, Admins can set availabilities
router.post('/', authorize(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN), availabilityController.setAvailability);

module.exports = router;
