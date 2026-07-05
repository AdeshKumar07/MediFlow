const { check, validationResult } = require('express-validator');
const ROLES = require('../constants/roles');
const ApiError = require('../utils/apiError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return next(new ApiError(400, 'Validation validation failed', formattedErrors));
  }
  next();
};

const registerValidator = [
  check('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .toLowerCase(),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
  check('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  check('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  check('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[0-9]{7,15}$/)
    .withMessage('Please provide a valid phone number (7–15 digits, optional + prefix)'),
  handleValidationErrors
];

const loginValidator = [
  check('emailOrUsername')
    .trim()
    .notEmpty()
    .withMessage('Email or Username is required')
    .toLowerCase(),
  check('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const forgotPasswordValidator = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  handleValidationErrors
];

const resetPasswordValidator = [
  check('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  check('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
