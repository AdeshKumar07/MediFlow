'use strict';

const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');
const ROLES = require('../constants/roles');

const router = express.Router();

// All dashboard routes are protected
router.use(protect);

// ════════════════════════════════════════════════════════════════════
//  ADMIN (Hospital Admin + Super Admin)
// ════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Retrieve admin dashboard metrics
 *     description: Returns aggregated hospital KPIs including totals for patients, doctors, revenue, appointments, and low stock count.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin metrics
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
 *                         stats:
 *                           type: object
 *                           properties:
 *                             totalPatients: { type: integer, example: 120 }
 *                             totalDoctors: { type: integer, example: 15 }
 *                             totalRevenue: { type: number, example: 250000 }
 *                             todayAppointments: { type: integer, example: 8 }
 *                             totalMedicines: { type: integer, example: 450 }
 *                             lowStockCount: { type: integer, example: 3 }
 *                             pendingInvoices: { type: integer, example: 5 }
 *                             totalReceptionists: { type: integer, example: 4 }
 *       403:
 *         description: Forbidden — access requires SUPER_ADMIN or HOSPITAL_ADMIN role
 */
router.get(
  '/admin',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN),
  dashboardController.getAdminDashboard
);

/**
 * @swagger
 * /api/dashboard/admin/charts:
 *   get:
 *     summary: Retrieve admin chart analytics data
 *     description: Returns time-series data for revenue trend, patient growth, and appointment statuses.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 6m, 12m]
 *           default: 6m
 *         description: Filter charts data by time window
 *     responses:
 *       200:
 *         description: Successfully retrieved chart data
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
 *                         charts:
 *                           type: object
 *                           properties:
 *                             revenueChart: { type: array, items: { type: object } }
 *                             patientGrowthChart: { type: array, items: { type: object } }
 *                             appointmentTrendChart: { type: array, items: { type: object } }
 */
router.get(
  '/admin/charts',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN),
  dashboardController.getAdminCharts
);

// ════════════════════════════════════════════════════════════════════
//  DOCTOR
// ════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/dashboard/doctor:
 *   get:
 *     summary: Retrieve doctor dashboard metrics
 *     description: Returns KPIs specific to the authenticated doctor, including today's appointment queue list.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved doctor metrics
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
 *                         stats:
 *                           type: object
 *                           properties:
 *                             todayTotal: { type: integer, example: 5 }
 *                             todayPending: { type: integer, example: 2 }
 *                             todayCompleted: { type: integer, example: 3 }
 *                             totalPatientsSeen: { type: integer, example: 45 }
 *                             todayList: { type: array, items: { type: object } }
 */
router.get(
  '/doctor',
  authorize(ROLES.DOCTOR),
  dashboardController.getDoctorDashboard
);

/**
 * @swagger
 * /api/dashboard/doctor/charts:
 *   get:
 *     summary: Retrieve doctor chart analytics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 6m]
 *           default: 30d
 *         description: Filter charts data by time window
 *     responses:
 *       200:
 *         description: Successfully retrieved doctor charts
 */
router.get(
  '/doctor/charts',
  authorize(ROLES.DOCTOR),
  dashboardController.getDoctorCharts
);

// ════════════════════════════════════════════════════════════════════
//  RECEPTIONIST
// ════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/dashboard/receptionist:
 *   get:
 *     summary: Retrieve receptionist dashboard metrics
 *     description: Returns front-desk queue info, checked-in patients, available doctors, and total appointments.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved receptionist metrics
 */
router.get(
  '/receptionist',
  authorize(ROLES.RECEPTIONIST),
  dashboardController.getReceptionistDashboard
);

/**
 * @swagger
 * /api/dashboard/receptionist/charts:
 *   get:
 *     summary: Retrieve receptionist chart analytics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved receptionist charts
 */
router.get(
  '/receptionist/charts',
  authorize(ROLES.RECEPTIONIST),
  dashboardController.getReceptionistCharts
);

// ════════════════════════════════════════════════════════════════════
//  REPORTS  (Admin + Super Admin only)
// ════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/dashboard/reports/revenue:
 *   get:
 *     summary: Retrieve filtered revenue report list
 *     description: Aggregated financial summary + paginated invoice records for the specified date range.
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 15 }
 *     responses:
 *       200:
 *         description: Successfully generated revenue report
 */
router.get(
  '/reports/revenue',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN),
  dashboardController.getRevenueReport
);

/**
 * @swagger
 * /api/dashboard/reports/patients:
 *   get:
 *     summary: Retrieve patient demographic report
 *     description: Gender distribution breakdown, blood group counts, and paginated patient profile listings.
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: gender
 *         schema: { type: string }
 *       - in: query
 *         name: bloodGroup
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Successfully generated patient report
 */
router.get(
  '/reports/patients',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN),
  dashboardController.getPatientReport
);

/**
 * @swagger
 * /api/dashboard/reports/appointments:
 *   get:
 *     summary: Retrieve appointment status report
 *     description: Status breakdown aggregates and granular appointment scheduler lists.
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Successfully generated appointment report
 */
router.get(
  '/reports/appointments',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
  dashboardController.getAppointmentReport
);

// ════════════════════════════════════════════════════════════════════
//  LEGACY routes — kept for backward compatibility
// ════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/dashboard/super-admin:
 *   get:
 *     summary: Legacy super-admin dashboard metrics
 *     tags: [Legacy Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Super admin metrics
 */
router.get(
  '/super-admin',
  authorize(ROLES.SUPER_ADMIN),
  dashboardController.getSuperAdminDashboard
);

/**
 * @swagger
 * /api/dashboard/hospital-admin:
 *   get:
 *     summary: Legacy hospital-admin dashboard metrics
 *     tags: [Legacy Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Hospital admin metrics
 */
router.get(
  '/hospital-admin',
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN),
  dashboardController.getHospitalAdminDashboard
);

/**
 * @swagger
 * /api/dashboard/pharmacist:
 *   get:
 *     summary: Pharmacist dashboard metrics
 *     tags: [Legacy Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pharmacist metrics
 */
router.get(
  '/pharmacist',
  authorize(ROLES.PHARMACIST),
  dashboardController.getPharmacistDashboard
);

/**
 * @swagger
 * /api/dashboard/lab-tech:
 *   get:
 *     summary: Lab technician dashboard metrics
 *     tags: [Legacy Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lab technician metrics
 */
router.get(
  '/lab-tech',
  authorize(ROLES.LAB_TECH),
  dashboardController.getLabTechDashboard
);

/**
 * @swagger
 * /api/dashboard/patient:
 *   get:
 *     summary: Patient portal metrics
 *     tags: [Legacy Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile metrics
 */
router.get(
  '/patient',
  authorize(ROLES.PATIENT),
  dashboardController.getPatientDashboard
);

module.exports = router;
