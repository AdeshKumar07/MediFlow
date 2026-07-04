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

const registerPatientValidator = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one digit'),
  check('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name must not exceed 50 characters'),
  check('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name must not exceed 50 characters'),
  check('phone')
    .optional()
    .isMobilePhone('any').withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

const updatePatientProfileValidator = [
  check('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date'),
  check('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  check('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  check('allergies')
    .optional()
    .isArray().withMessage('Allergies must be an array'),
  check('emergencyContact.phone')
    .optional()
    .isMobilePhone('any').withMessage('Invalid emergency contact phone number'),
  handleValidationErrors
];

module.exports = { registerPatientValidator, updatePatientProfileValidator };
