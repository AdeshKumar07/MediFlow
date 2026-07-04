'use strict';

const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');
const {
  createInvoiceValidator,
  updateInvoiceValidator,
  createOrderValidator,
  verifyPaymentValidator
} = require('../validators/billing.validator');

router.use(protect);

/**
 * @swagger
 * /api/billing/invoices:
 *   get:
 *     summary: List invoices (role-filtered)
 *     tags: [Billing]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, PAID, PARTIALLY_PAID, CANCELLED]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Paginated invoice list
 *   post:
 *     summary: Create a new invoice
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: Invoice created
 *       403:
 *         description: Receptionist/Admin only
 *
 * /api/billing/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice details
 *       404:
 *         description: Invoice not found
 *   put:
 *     summary: Update invoice
 *     tags: [Billing]
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
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: Invoice updated
 *   delete:
 *     summary: Delete invoice (Admin only)
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted
 *
 * /api/billing/invoices/{id}/finalize:
 *   patch:
 *     summary: Finalize invoice (lock for payment)
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice finalized
 *
 * /api/billing/invoices/{id}/pdf:
 *   get:
 *     summary: Download invoice PDF
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF binary stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *
 * /api/billing/payments:
 *   get:
 *     summary: List payment transactions
 *     tags: [Billing]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CREATED, SUCCESS, FAILED, REFUNDED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Paginated payment list
 *
 * /api/billing/payments/create-order:
 *   post:
 *     summary: Create Razorpay order for an invoice
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceId]
 *             properties:
 *               invoiceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Razorpay order created
 *
 * /api/billing/payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpayOrderId, razorpayPaymentId, razorpaySignature, invoiceId]
 *             properties:
 *               razorpayOrderId:    { type: string }
 *               razorpayPaymentId:  { type: string }
 *               razorpaySignature:  { type: string }
 *               invoiceId:          { type: string }
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature
 */


// ─── Invoice Routes ───────────────────────────────────────────────────────────
router.get(
  '/invoices',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  billingController.getInvoices
);

router.post(
  '/invoices',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST),
  createInvoiceValidator,
  billingController.createInvoice
);

router.get(
  '/invoices/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  billingController.getInvoiceById
);

router.put(
  '/invoices/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST),
  updateInvoiceValidator,
  billingController.updateInvoice
);

router.delete(
  '/invoices/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN),
  billingController.deleteInvoice
);

router.patch(
  '/invoices/:id/finalize',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST),
  billingController.finalizeInvoice
);

// ─── Payment Transaction Routes ───────────────────────────────────────────────
router.get(
  '/payments',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  billingController.getPaymentHistory
);

router.get(
  '/payments/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  billingController.getPaymentById
);

// ─── Razorpay Payment Flow Routes ────────────────────────────────────────────
router.post(
  '/payments/create-order',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  createOrderValidator,
  paymentController.createOrder
);

router.post(
  '/payments/verify',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  verifyPaymentValidator,
  paymentController.verifyPayment
);

router.post(
  '/payments/failure',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  paymentController.paymentFailure
);

// ─── PDF Download Routes ──────────────────────────────────────────────────────
router.get(
  '/invoices/:id/pdf',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  paymentController.downloadInvoicePdf
);

router.get(
  '/payments/:id/receipt',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  paymentController.downloadReceiptPdf
);

module.exports = router;
