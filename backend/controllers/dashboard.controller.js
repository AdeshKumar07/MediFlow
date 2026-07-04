'use strict';

const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/apiResponse');

class DashboardController {

  // ─── Admin / Super-Admin ────────────────────────────────────────────
  async getAdminDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getAdminStats();
      res.status(200).json(new ApiResponse(200, { stats }, 'Admin dashboard metrics loaded.'));
    } catch (err) { next(err); }
  }

  async getAdminCharts(req, res, next) {
    try {
      const period = req.query.period || '6m';
      const charts = await dashboardService.getAdminCharts(period);
      res.status(200).json(new ApiResponse(200, { charts }, 'Admin chart data loaded.'));
    } catch (err) { next(err); }
  }

  // ─── Doctor ─────────────────────────────────────────────────────────
  async getDoctorDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getDoctorStats(req.user.id);
      res.status(200).json(new ApiResponse(200, { stats }, 'Doctor metrics loaded.'));
    } catch (err) { next(err); }
  }

  async getDoctorCharts(req, res, next) {
    try {
      const period = req.query.period || '30d';
      const charts = await dashboardService.getDoctorCharts(req.user.id, period);
      res.status(200).json(new ApiResponse(200, { charts }, 'Doctor chart data loaded.'));
    } catch (err) { next(err); }
  }

  // ─── Receptionist ───────────────────────────────────────────────────
  async getReceptionistDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getReceptionistStats();
      res.status(200).json(new ApiResponse(200, { stats }, 'Receptionist metrics loaded.'));
    } catch (err) { next(err); }
  }

  async getReceptionistCharts(req, res, next) {
    try {
      const period = req.query.period || '30d';
      const charts = await dashboardService.getReceptionistCharts(period);
      res.status(200).json(new ApiResponse(200, { charts }, 'Receptionist chart data loaded.'));
    } catch (err) { next(err); }
  }

  // ─── Reports ────────────────────────────────────────────────────────
  async getRevenueReport(req, res, next) {
    try {
      const { startDate, endDate, page, limit } = req.query;
      const result = await dashboardService.getRevenueReport({ startDate, endDate, page, limit });
      res.status(200).json(new ApiResponse(200, result, 'Revenue report generated.'));
    } catch (err) { next(err); }
  }

  async getPatientReport(req, res, next) {
    try {
      const { gender, bloodGroup, page, limit } = req.query;
      const result = await dashboardService.getPatientReport({ gender, bloodGroup, page, limit });
      res.status(200).json(new ApiResponse(200, result, 'Patient report generated.'));
    } catch (err) { next(err); }
  }

  async getAppointmentReport(req, res, next) {
    try {
      const { status, doctorId, startDate, endDate, page, limit } = req.query;
      const result = await dashboardService.getAppointmentReport({ status, doctorId, startDate, endDate, page, limit });
      res.status(200).json(new ApiResponse(200, result, 'Appointment report generated.'));
    } catch (err) { next(err); }
  }

  // ─── Legacy routes (kept for backward compatibility) ────────────────
  async getSuperAdminDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getSuperAdminStats();
      res.status(200).json(new ApiResponse(200, { stats }, 'Super Admin metrics loaded.'));
    } catch (err) { next(err); }
  }

  async getHospitalAdminDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getAdminStats();
      res.status(200).json(new ApiResponse(200, { stats }, 'Hospital Admin metrics loaded.'));
    } catch (err) { next(err); }
  }

  async getPharmacistDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getPharmacistStats();
      res.status(200).json(new ApiResponse(200, { stats }, 'Pharmacist metrics loaded.'));
    } catch (err) { next(err); }
  }

  async getLabTechDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getLabTechStats();
      res.status(200).json(new ApiResponse(200, { stats }, 'Lab Tech metrics loaded.'));
    } catch (err) { next(err); }
  }

  async getPatientDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getPatientStats(req.user.id);
      res.status(200).json(new ApiResponse(200, { stats }, 'Patient metrics loaded.'));
    } catch (err) { next(err); }
  }
}

module.exports = new DashboardController();
