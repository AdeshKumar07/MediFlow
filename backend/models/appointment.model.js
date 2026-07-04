const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  branchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Branch', 
    required: [true, 'Branch is required'] 
  },
  date: { 
    type: Date, 
    required: [true, 'Appointment date is required'] 
  },
  timeSlot: { 
    type: String, 
    required: [true, 'Time slot is required'] // e.g. "09:00 AM - 09:30 AM"
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'], 
    default: 'PENDING' 
  },
  queueNumber: { 
    type: Number 
  },
  reason: { 
    type: String,
    trim: true,
    required: [true, 'Reason for appointment is required']
  },
  notes: { 
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
