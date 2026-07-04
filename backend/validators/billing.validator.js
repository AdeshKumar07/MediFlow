const { body, query } = require('express-validator');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(422, 'Validation failed', errors.array()));
  }
  next();
};

const createInvoiceValidator = [
  body('patientId').notEmpty().withMessage('Patient ID is required').isMongoId().withMessage('Invalid patient ID'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.category').isIn(['consultation', 'medicine', 'laboratory', 'other']).withMessage('Invalid item category'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('discountValue').optional().isFloat({ min: 0 }).withMessage('Discount must be a positive number'),
  body('discountType').optional().isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('notes').optional().trim(),
  handleValidationErrors
];

const updateInvoiceValidator = [
  body('items').optional().isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.description').optional().notEmpty().withMessage('Item description cannot be empty'),
  body('items.*.category').optional().isIn(['consultation', 'medicine', 'laboratory', 'other']),
  body('items.*.unitPrice').optional().isFloat({ min: 0 }),
  body('discountValue').optional().isFloat({ min: 0 }),
  body('discountType').optional().isIn(['percentage', 'fixed']),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }),
  body('status').optional().isIn(['DRAFT', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED']),
  handleValidationErrors
];

const createOrderValidator = [
  body('invoiceId').notEmpty().withMessage('Invoice ID is required').isMongoId().withMessage('Invalid invoice ID'),
  handleValidationErrors
];

const verifyPaymentValidator = [
  body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
  body('invoiceId').notEmpty().isMongoId().withMessage('Valid invoice ID is required'),
  handleValidationErrors
];

module.exports = {
  createInvoiceValidator,
  updateInvoiceValidator,
  createOrderValidator,
  verifyPaymentValidator
};
