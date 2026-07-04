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

const createLabTestValidator = [
  check('patientId')
    .notEmpty()
    .withMessage('Patient is required')
    .isMongoId()
    .withMessage('Invalid Patient ID'),
  check('testName')
    .trim()
    .notEmpty()
    .withMessage('Test name is required'),
  check('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  handleValidationErrors
];

const updateLabTestValidator = [
  check('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be PENDING, IN_PROGRESS, or COMPLETED'),
  check('resultSummary')
    .optional()
    .trim(),
  check('reportPdf')
    .optional()
    .trim(),
  handleValidationErrors
];

module.exports = {
  createLabTestValidator,
  updateLabTestValidator
};
