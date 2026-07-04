const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Patient is required'] 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Doctor is required'] 
  },
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  category: {
    type: String, // e.g., Blood, Urine, Imaging
    required: [true, 'Category is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING'
  },
  resultSummary: {
    type: String,
    trim: true
  },
  reportPdf: {
    type: String,
    trim: true
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
