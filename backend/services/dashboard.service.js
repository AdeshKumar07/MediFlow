'use strict';

const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Medicine = require('../models/medicine.model');
const LabTest = require('../models/labTest.model');
const Invoice = require('../models/invoice.model');
const Payment = require('../models/payment.model');
const PatientProfile = require('../models/patientProfile.model');
const ROLES = require('../constants/roles');

// ─── Helpers ───────────────────────────────────────────────────────────────
const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay   = (d = new Date()) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

/**
 * Returns { start, end } for a given period string:
 *   '7d' | '30d' | '6m' | '12m'
 */
function getPeriodRange(period = '6m') {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case '7d':  start.setDate(start.getDate() - 7);        break;
    case '30d': start.setDate(start.getDate() - 30);       break;
    case '12m': start.setMonth(start.getMonth() - 12);     break;
    case '6m':
    default:    start.setMonth(start.getMonth() - 6);      break;
  }
  return { start, end };
}

// ─── Month label helper ─────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

class DashboardService {

  // ════════════════════════════════════════════════════════════════════
  //  ADMIN / SUPER-ADMIN STATS
  // ════════════════════════════════════════════════════════════════════

  async getAdminStats() {
    const todayStart = startOfDay();
    const todayEnd   = endOfDay();

    const [
      totalPatients,
      totalDoctors,
      revenueAgg,
      todayAppointments,
      totalMedicines,
      lowStockCount,
      pendingInvoices,
      totalReceptionists,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.PATIENT }),
      User.countDocuments({ role: ROLES.DOCTOR }),

      // Total revenue from PAID invoices
      Invoice.aggregate([
        { $match: { status: { $in: ['PAID', 'PARTIALLY_PAID'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      // Today's appointments (all statuses)
      Appointment.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd },
      }),

      Medicine.countDocuments(),

      // Low stock: < 20 units
      Medicine.countDocuments({ stock: { $lt: 20 } }),

      // Pending invoices count
      Invoice.countDocuments({ status: { $in: ['PENDING', 'DRAFT'] } }),

      User.countDocuments({ role: ROLES.RECEPTIONIST }),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    return {
      totalPatients,
      totalDoctors,
      totalRevenue,
      todayAppointments,
      totalMedicines,
      lowStockCount,
      pendingInvoices,
      totalReceptionists,
    };
  }

  // ─── Admin Charts ──────────────────────────────────────────────────

  async getAdminCharts(period = '6m') {
    const { start, end } = getPeriodRange(period);
    const isPeriodInDays = period === '7d' || period === '30d';

    const [revenueChart, patientGrowthChart, appointmentTrendChart] = await Promise.all([
      this._getRevenueChart(start, end, isPeriodInDays),
      this._getPatientGrowthChart(start, end, isPeriodInDays),
      this._getAppointmentTrendChart(start, end, isPeriodInDays),
    ]);

    return { revenueChart, patientGrowthChart, appointmentTrendChart };
  }

  async _getRevenueChart(start, end, byDay = false) {
    const groupId = byDay
      ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };

    const raw = await Invoice.aggregate([
      { $match: { status: { $in: ['PAID', 'PARTIALLY_PAID'] }, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: groupId, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return raw.map(r => ({
      label: byDay
        ? `${String(r._id.day).padStart(2,'0')}/${MONTH_NAMES[r._id.month - 1]}`
        : `${MONTH_NAMES[r._id.month - 1]} ${r._id.year}`,
      revenue: parseFloat(r.revenue.toFixed(2)),
      invoices: r.count,
    }));
  }

  async _getPatientGrowthChart(start, end, byDay = false) {
    const groupId = byDay
      ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };

    const raw = await User.aggregate([
      { $match: { role: ROLES.PATIENT, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: groupId, newPatients: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return raw.map(r => ({
      label: byDay
        ? `${String(r._id.day).padStart(2,'0')}/${MONTH_NAMES[r._id.month - 1]}`
        : `${MONTH_NAMES[r._id.month - 1]} ${r._id.year}`,
      patients: r.newPatients,
    }));
  }

  async _getAppointmentTrendChart(start, end, byDay = false) {
    const groupId = byDay
      ? { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } }
      : { year: { $year: '$date' }, month: { $month: '$date' } };

    const raw = await Appointment.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: groupId,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
          pending:   { $sum: { $cond: [{ $eq: ['$status', 'PENDING']   }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return raw.map(r => ({
      label: byDay
        ? `${String(r._id.day).padStart(2,'0')}/${MONTH_NAMES[r._id.month - 1]}`
        : `${MONTH_NAMES[r._id.month - 1]} ${r._id.year}`,
      total: r.total,
      completed: r.completed,
      cancelled: r.cancelled,
      pending: r.pending,
    }));
  }

  // ════════════════════════════════════════════════════════════════════
  //  ADMIN REPORTS
  // ════════════════════════════════════════════════════════════════════

  async getRevenueReport({ startDate, endDate, page = 1, limit = 20 }) {
    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate)   matchFilter.createdAt.$lte = endOfDay(new Date(endDate));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [summary, invoices, total] = await Promise.all([
      // Summary aggregation
      Invoice.aggregate([
        { $match: { ...matchFilter } },
        {
          $group: {
            _id: null,
            totalRevenue:  { $sum: { $cond: [{ $in: ['$status', ['PAID','PARTIALLY_PAID']] }, '$totalAmount', 0] } },
            totalInvoices: { $sum: 1 },
            paidCount:     { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] } },
            pendingCount:  { $sum: { $cond: [{ $in: ['$status', ['PENDING','DRAFT']] }, 1, 0] } },
            cancelledCount:{ $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
          },
        },
      ]),

      // Paginated invoice list
      Invoice.find(matchFilter)
        .populate('patientId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),

      Invoice.countDocuments(matchFilter),
    ]);

    return {
      summary: summary[0] || { totalRevenue: 0, totalInvoices: 0, paidCount: 0, pendingCount: 0, cancelledCount: 0 },
      invoices,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    };
  }

  async getPatientReport({ gender, bloodGroup, page = 1, limit = 20 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build profile filter
    const profileFilter = {};
    if (gender)     profileFilter.gender = gender;
    if (bloodGroup) profileFilter.bloodGroup = bloodGroup;

    const [breakdown, profiles, total] = await Promise.all([
      // Gender + blood-group breakdown
      PatientProfile.aggregate([
        {
          $group: {
            _id: { gender: '$gender', bloodGroup: '$bloodGroup' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Patient list with profile
      PatientProfile.find(profileFilter)
        .populate('userId', 'firstName lastName email createdAt isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),

      PatientProfile.countDocuments(profileFilter),
    ]);

    // Summarise genders
    const genderSummary = {};
    const bloodGroupSummary = {};
    breakdown.forEach(b => {
      const g = b._id.gender || 'Unknown';
      const bg = b._id.bloodGroup || 'Unknown';
      genderSummary[g]   = (genderSummary[g]   || 0) + b.count;
      bloodGroupSummary[bg] = (bloodGroupSummary[bg] || 0) + b.count;
    });

    return {
      summary: { genderSummary, bloodGroupSummary },
      patients: profiles,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    };
  }

  async getAppointmentReport({ status, doctorId, startDate, endDate, page = 1, limit = 20 }) {
    const matchFilter = {};
    if (status)   matchFilter.status   = status;
    if (doctorId) matchFilter.doctorId = require('mongoose').Types.ObjectId.createFromHexString(doctorId);
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) matchFilter.date.$gte = new Date(startDate);
      if (endDate)   matchFilter.date.$lte = endOfDay(new Date(endDate));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [summary, appointments, total] = await Promise.all([
      // Status breakdown
      Appointment.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Paginated appointments
      Appointment.find(matchFilter)
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId',  'firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),

      Appointment.countDocuments(matchFilter),
    ]);

    const statusSummary = {};
    summary.forEach(s => { statusSummary[s._id] = s.count; });

    return {
      summary: { statusSummary, total },
      appointments,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    };
  }

  // ════════════════════════════════════════════════════════════════════
  //  DOCTOR STATS & CHARTS
  // ════════════════════════════════════════════════════════════════════

  async getDoctorStats(doctorId) {
    const todayStart = startOfDay();
    const todayEnd   = endOfDay();

    const [
      todayTotal,
      todayPending,
      todayCompleted,
      todayConfirmed,
      totalPatientsSeen,
      upcomingAll,
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId, date: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.countDocuments({ doctorId, status: 'PENDING',   date: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.countDocuments({ doctorId, status: 'COMPLETED', date: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.countDocuments({ doctorId, status: 'CONFIRMED', date: { $gte: todayStart, $lte: todayEnd } }),

      // Unique patients ever seen
      Appointment.distinct('patientId', { doctorId, status: 'COMPLETED' }).then(arr => arr.length),

      // All upcoming (future dates)
      Appointment.countDocuments({ doctorId, status: { $in: ['PENDING','CONFIRMED'] }, date: { $gte: todayStart } }),
    ]);

    // Today's appointment list
    const todayList = await Appointment.find({ doctorId, date: { $gte: todayStart, $lte: todayEnd } })
      .populate('patientId', 'firstName lastName email')
      .sort({ timeSlot: 1 })
      .lean();

    return {
      todayTotal,
      todayPending,
      todayCompleted,
      todayConfirmed,
      totalPatientsSeen,
      upcomingAll,
      todayList,
    };
  }

  async getDoctorCharts(doctorId, period = '30d') {
    const { start, end } = getPeriodRange(period);
    const byDay = period === '7d' || period === '30d';

    const groupId = byDay
      ? { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } }
      : { year: { $year: '$date' }, month: { $month: '$date' } };

    const mongoose = require('mongoose');
    const docId = mongoose.Types.ObjectId.createFromHexString(doctorId);

    const raw = await Appointment.aggregate([
      { $match: { doctorId: docId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: groupId,
          total:     { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status','COMPLETED'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status','CANCELLED'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const appointmentTrend = raw.map(r => ({
      label: byDay
        ? `${String(r._id.day).padStart(2,'0')}/${MONTH_NAMES[r._id.month - 1]}`
        : `${MONTH_NAMES[r._id.month - 1]} ${r._id.year}`,
      total: r.total,
      completed: r.completed,
      cancelled: r.cancelled,
    }));

    return { appointmentTrend };
  }

  // ════════════════════════════════════════════════════════════════════
  //  RECEPTIONIST STATS & CHARTS
  // ════════════════════════════════════════════════════════════════════

  async getReceptionistStats() {
    const todayStart = startOfDay();
    const todayEnd   = endOfDay();

    const [
      checkInsToday,
      pendingConsultations,
      confirmedToday,
      availableDoctors,
      totalAppointmentsEver,
    ] = await Promise.all([
      Appointment.countDocuments({ status: 'COMPLETED', date: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.countDocuments({ status: 'PENDING',   date: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.countDocuments({ status: 'CONFIRMED', date: { $gte: todayStart, $lte: todayEnd } }),
      User.countDocuments({ role: ROLES.DOCTOR, isActive: true }),
      Appointment.countDocuments(),
    ]);

    // Today's full queue
    const todayQueue = await Appointment.find({ date: { $gte: todayStart, $lte: todayEnd } })
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId',  'firstName lastName')
      .sort({ queueNumber: 1, timeSlot: 1 })
      .lean();

    return {
      checkInsToday,
      pendingConsultations,
      confirmedToday,
      availableDoctors,
      totalAppointmentsEver,
      todayQueue,
    };
  }

  async getReceptionistCharts(period = '30d') {
    const { start, end } = getPeriodRange(period);
    const byDay = period === '7d' || period === '30d';

    const [appointmentTrendRaw, statusBreakdown] = await Promise.all([
      this._getAppointmentTrendChart(start, end, byDay),
      Appointment.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusData = statusBreakdown.map(s => ({ name: s._id, value: s.count }));

    return { appointmentTrend: appointmentTrendRaw, statusData };
  }

  // ════════════════════════════════════════════════════════════════════
  //  LEGACY — kept for backwards compatibility with existing routes
  // ════════════════════════════════════════════════════════════════════

  async getSuperAdminStats() {
    const totalUsers    = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: ROLES.PATIENT });
    const totalStaff    = totalUsers - totalPatients;
    return { totalUsers, totalPatients, totalStaff, uptime: '99.98%' };
  }

  async getHospitalAdminStats() {
    return this.getAdminStats();
  }

  async getPharmacistStats() {
    const totalMedicines = await Medicine.countDocuments();
    const lowStockAlerts = await Medicine.countDocuments({ stock: { $lt: 20 } });
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const expiringSoon = await Medicine.countDocuments({ expiryDate: { $gte: now, $lte: in30Days } });
    return { totalMedicines, lowStockAlerts, expiringSoon };
  }

  async getLabTechStats() {
    const today = startOfDay();
    const pendingTests        = await LabTest.countDocuments({ status: 'PENDING' });
    const inProgressTests     = await LabTest.countDocuments({ status: 'IN_PROGRESS' });
    const completedTestsToday = await LabTest.countDocuments({ status: 'COMPLETED', completedAt: { $gte: today } });
    return { pendingTests, inProgressTests, completedTestsToday };
  }

  async getPatientStats(patientId) {
    const now = new Date();
    const upcomingVisits  = await Appointment.countDocuments({ patientId, status: { $in: ['PENDING','CONFIRMED','RESCHEDULED'] }, date: { $gte: now } });
    const completedVisits = await Appointment.countDocuments({ patientId, status: 'COMPLETED' });
    return { upcomingVisits, completedVisits, prescriptionsActive: 0 };
  }
}

module.exports = new DashboardService();
