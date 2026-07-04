const mongoose = require('mongoose');

const staffProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  qualification: { type: String, trim: true },
  experienceYears: { type: Number, min: 0 },
  specialization: { type: String, trim: true },
  consultationFee: { type: Number, min: 0, default: 0 },
  bio: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('StaffProfile', staffProfileSchema);
