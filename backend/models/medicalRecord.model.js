const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment',
    required: false
  },
  diagnosis: { 
    type: String, 
    trim: true,
    required: [true, 'Diagnosis is required'] 
  },
  symptoms: [{ 
    type: String, 
    trim: true 
  }],
  vitals: {
    bloodPressure: { type: String, trim: true },
    pulseRate: { type: String, trim: true },
    temperature: { type: String, trim: true },
    weight: { type: String, trim: true },
    height: { type: String, trim: true }
  },
  treatmentHistory: [{ 
    type: String, 
    trim: true 
  }],
  medicines: [{
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    dispensed: { type: Boolean, default: false },
    dispensedAt: { type: Date }
  }],
  consultationNotes: { 
    type: String, 
    trim: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
