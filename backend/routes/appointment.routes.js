'use strict';

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(protect);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookAppointmentRequest'
 *     responses:
 *       201:
 *         description: Appointment booked successfully
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
 *                         appointment:
 *                           $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error
 *   get:
 *     summary: List appointments (filtered by role)
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED, RESCHEDULED]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
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
 *         description: List of appointments
 */
router.post('/', appointmentController.bookAppointment);
router.get('/',  appointmentController.getAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
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
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Insufficient role
 */
router.patch('/:id/status',
  authorize(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  appointmentController.updateAppointmentStatus
);

/**
 * @swagger
 * /api/appointments/{id}/reschedule:
 *   patch:
 *     summary: Reschedule an appointment
 *     tags: [Appointments]
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
 *             type: object
 *             required: [date, timeSlot]
 *             properties:
 *               date:     { type: string, format: date }
 *               timeSlot: { type: string, example: '11:00 AM - 11:30 AM' }
 *     responses:
 *       200:
 *         description: Appointment rescheduled
 */
router.patch('/:id/reschedule',
  authorize(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  appointmentController.rescheduleAppointment
);

module.exports = router;
