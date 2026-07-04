const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const ConsultationNote = require('../models/consultationNote.model');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

// All routes require authentication
router.use(protect);

/**
 * GET /api/notes/patient/:patientId
 * Doctor fetches the full message thread with a specific patient.
 * Also marks all unread patient messages as read.
 */
router.get('/patient/:patientId', authorize('DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'), async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    // Verify patient exists
    const patient = await User.findById(patientId).select('firstName lastName email role');
    if (!patient || patient.role !== 'PATIENT') {
      return next(new ApiError(404, 'Patient not found'));
    }

    // Mark patient's messages to this doctor as read
    await ConsultationNote.updateMany(
      { patientId, doctorId, senderRole: 'PATIENT', isRead: false },
      { isRead: true }
    );

    const notes = await ConsultationNote.find({ patientId, doctorId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, data: { patient, notes } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notes/patient/:patientId
 * Doctor sends a new consultation note to a patient.
 */
router.post('/patient/:patientId', authorize('DOCTOR'), async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { message } = req.body;
    const doctorId = req.user._id;

    if (!message || !message.trim()) {
      return next(new ApiError(400, 'Message cannot be empty'));
    }

    const patient = await User.findById(patientId).select('role');
    if (!patient || patient.role !== 'PATIENT') {
      return next(new ApiError(404, 'Patient not found'));
    }

    const note = await ConsultationNote.create({
      patientId,
      doctorId,
      message: message.trim(),
      senderRole: 'DOCTOR'
    });

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/notes/my
 * Patient fetches all consultation threads (grouped by doctor).
 */
router.get('/my', authorize('PATIENT'), async (req, res, next) => {
  try {
    const patientId = req.user._id;

    // Get unique doctorIds who have messaged this patient
    const doctorIds = await ConsultationNote.distinct('doctorId', { patientId });

    const threads = await Promise.all(
      doctorIds.map(async (doctorId) => {
        const doctor = await User.findById(doctorId).select('firstName lastName email');
        const lastNote = await ConsultationNote.findOne({ patientId, doctorId })
          .sort({ createdAt: -1 })
          .lean();
        const unreadCount = await ConsultationNote.countDocuments({
          patientId,
          doctorId,
          senderRole: 'DOCTOR',
          isRead: false
        });
        return { doctor, lastNote, unreadCount };
      })
    );

    // Sort by most recent message
    threads.sort((a, b) => new Date(b.lastNote?.createdAt) - new Date(a.lastNote?.createdAt));

    res.json({ success: true, data: threads });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/notes/thread/:doctorId
 * Patient fetches the full thread with a specific doctor.
 */
router.get('/thread/:doctorId', authorize('PATIENT'), async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId } = req.params;

    const doctor = await User.findById(doctorId).select('firstName lastName email role');
    if (!doctor || doctor.role !== 'DOCTOR') {
      return next(new ApiError(404, 'Doctor not found'));
    }

    // Mark doctor's messages to this patient as read
    await ConsultationNote.updateMany(
      { patientId, doctorId, senderRole: 'DOCTOR', isRead: false },
      { isRead: true }
    );

    const notes = await ConsultationNote.find({ patientId, doctorId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, data: { doctor, notes } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notes/reply/:doctorId
 * Patient replies to a doctor's message.
 */
router.post('/reply/:doctorId', authorize('PATIENT'), async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return next(new ApiError(400, 'Message cannot be empty'));
    }

    const doctor = await User.findById(doctorId).select('role');
    if (!doctor || doctor.role !== 'DOCTOR') {
      return next(new ApiError(404, 'Doctor not found'));
    }

    const note = await ConsultationNote.create({
      patientId,
      doctorId,
      message: message.trim(),
      senderRole: 'PATIENT'
    });

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/notes/inbox
 * Doctor fetches all patient threads (for their inbox overview).
 */
router.get('/inbox', authorize('DOCTOR'), async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const patientIds = await ConsultationNote.distinct('patientId', { doctorId });

    const threads = await Promise.all(
      patientIds.map(async (patientId) => {
        const patient = await User.findById(patientId).select('firstName lastName email');
        const lastNote = await ConsultationNote.findOne({ patientId, doctorId })
          .sort({ createdAt: -1 })
          .lean();
        const unreadCount = await ConsultationNote.countDocuments({
          patientId,
          doctorId,
          senderRole: 'PATIENT',
          isRead: false
        });
        return { patient, lastNote, unreadCount };
      })
    );

    threads.sort((a, b) => new Date(b.lastNote?.createdAt) - new Date(a.lastNote?.createdAt));

    res.json({ success: true, data: threads });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
