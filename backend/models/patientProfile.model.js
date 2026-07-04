const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  uploadedAt: { type: Date, default: Date.now }
});

const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  allergies: [{ type: String, trim: true }],
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  medicalHistory: [{ type: String, trim: true }],
  uploadedDocuments: [documentSchema]
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
