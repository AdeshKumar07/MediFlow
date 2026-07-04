'use strict';

const logger = require('../utils/logger');

/**
 * Creates all production indexes across MongoDB collections.
 * Safe to call on every startup — createIndex is idempotent.
 *
 * Index strategy:
 *  - Compound indexes follow ESR (Equality → Sort → Range) rule
 *  - Sparse indexes used where field is optional
 *  - TTL index on Token.expiresAt for automatic expiry cleanup
 */
const createIndexes = async () => {
  try {
    // ── Import models (lazy to avoid circular deps at require-time) ──
    const User           = require('../models/user.model');
    const Appointment    = require('../models/appointment.model');
    const Invoice        = require('../models/invoice.model');
    const Payment        = require('../models/payment.model');
    const Medicine       = require('../models/medicine.model');
    const LabTest        = require('../models/labTest.model');
    const PatientProfile = require('../models/patientProfile.model');
    const Token          = require('../models/token.model');
    const MedicalRecord  = require('../models/medicalRecord.model');

    // ── User ─────────────────────────────────────────────────────────
    await User.collection.createIndex({ email: 1 },    { unique: true, background: true });
    await User.collection.createIndex({ username: 1 }, { unique: true, background: true });
    await User.collection.createIndex({ role: 1 },     { background: true });
    await User.collection.createIndex({ role: 1, isActive: 1 }, { background: true });

    // ── Appointment ───────────────────────────────────────────────────
    await Appointment.collection.createIndex({ patientId: 1, date: -1 },  { background: true });
    await Appointment.collection.createIndex({ doctorId: 1,  date: -1 },  { background: true });
    await Appointment.collection.createIndex({ status: 1,    date: -1 },  { background: true });
    await Appointment.collection.createIndex({ doctorId: 1, status: 1, date: -1 }, { background: true });
    await Appointment.collection.createIndex({ date: -1 },                { background: true });
    await Appointment.collection.createIndex({ branchId: 1, date: -1 },  { background: true });

    // ── Invoice ───────────────────────────────────────────────────────
    await Invoice.collection.createIndex({ patientId: 1, status: 1 },    { background: true });
    await Invoice.collection.createIndex({ status: 1, createdAt: -1 },   { background: true });
    await Invoice.collection.createIndex({ createdAt: -1 },              { background: true });
    try {
      await Invoice.collection.dropIndex("invoiceNumber_1");
    } catch (e) {
      // Ignore if index does not exist or matches options
    }
    await Invoice.collection.createIndex({ invoiceNumber: 1 },           { unique: true, sparse: true, background: true });
    await Invoice.collection.createIndex({ appointmentId: 1 },           { sparse: true, background: true });

    // ── Payment ───────────────────────────────────────────────────────
    await Payment.collection.createIndex({ patientId: 1, status: 1 },   { background: true });
    await Payment.collection.createIndex({ invoiceId: 1 },              { background: true });
    await Payment.collection.createIndex({ status: 1, paidAt: -1 },     { background: true });
    try {
      await Payment.collection.dropIndex("receiptNumber_1");
    } catch (e) {
      // Ignore if index does not exist or matches options
    }
    await Payment.collection.createIndex({ receiptNumber: 1 },          { unique: true, sparse: true, background: true });

    // ── Medicine ──────────────────────────────────────────────────────
    await Medicine.collection.createIndex({ name: 1, category: 1 },     { background: true });
    await Medicine.collection.createIndex({ stock: 1 },                 { background: true });
    await Medicine.collection.createIndex({ expiryDate: 1 },            { background: true });
    await Medicine.collection.createIndex({ category: 1 },             { background: true });

    // ── LabTest ───────────────────────────────────────────────────────
    await LabTest.collection.createIndex({ patientId: 1, status: 1 },   { background: true });
    await LabTest.collection.createIndex({ doctorId: 1,  status: 1 },   { background: true });
    await LabTest.collection.createIndex({ status: 1 },                 { background: true });
    await LabTest.collection.createIndex({ createdAt: -1 },             { background: true });

    // ── PatientProfile ────────────────────────────────────────────────
    await PatientProfile.collection.createIndex({ userId: 1 },          { unique: true, background: true });
    await PatientProfile.collection.createIndex({ gender: 1 },          { background: true });
    await PatientProfile.collection.createIndex({ bloodGroup: 1 },      { background: true });

    // ── Token (Refresh tokens) — TTL index auto-deletes expired docs ──
    await Token.collection.createIndex({ token: 1 },                    { unique: true, background: true });
    await Token.collection.createIndex({ userId: 1 },                   { background: true });
    await Token.collection.createIndex({ expiresAt: 1 },                { expireAfterSeconds: 0, background: true });

    // ── MedicalRecord ─────────────────────────────────────────────────
    await MedicalRecord.collection.createIndex({ patientId: 1, createdAt: -1 }, { background: true });
    await MedicalRecord.collection.createIndex({ doctorId: 1,  createdAt: -1 }, { background: true });
    await MedicalRecord.collection.createIndex({ appointmentId: 1 },           { sparse: true, background: true });

    logger.info('✅ MongoDB indexes created/verified successfully.');
  } catch (error) {
    // Non-fatal — log and continue; indexes can be fixed without app restart
    logger.error(`⚠ Index creation error: ${error.message}`);
  }
};

module.exports = createIndexes;
