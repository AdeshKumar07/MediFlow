const { check, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return next(new ApiError(400, 'Validation failed', formattedErrors));
  }
  next();
};

const medicineValidator = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ max: 100 })
    .withMessage('Medicine name cannot exceed 100 characters'),
  check('brand')
    .optional()
    .trim(),
  check('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  check('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  check('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  check('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Please enter a valid expiry date'),
  check('batchNumber')
    .optional()
    .trim(),
  check('manufacturer')
    .optional()
    .trim(),
  check('dosage')
    .optional()
    .trim(),
  handleValidationErrors
];

module.exports = {
  medicineValidator
};
