'use strict';

const { check, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path || e.param, message: e.msg }));
    return next(new ApiError(400, 'Validation failed', formatted));
  }
  next();
};

const bookAppointmentValidator = [
  check('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID format'),
  check('doctorId')
    .notEmpty().withMessage('Doctor ID is required')
    .isMongoId().withMessage('Invalid doctor ID format'),
  check('branchId')
    .optional()
    .isMongoId().withMessage('Invalid branch ID format'),
  check('date')
    .notEmpty().withMessage('Appointment date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date (YYYY-MM-DD)')
    .custom((val) => {
      if (new Date(val) < new Date(new Date().setHours(0,0,0,0))) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  check('timeSlot')
    .trim()
    .notEmpty().withMessage('Time slot is required'),
  check('reason')
    .trim()
    .notEmpty().withMessage('Reason for appointment is required')
    .isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters'),
  check('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  handleValidationErrors
];

module.exports = { bookAppointmentValidator };
