const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
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
  dayOfWeek: { 
    type: Number, // 0 for Sunday, 1 for Monday, etc.
    required: [true, 'Day of week is required'],
    min: 0,
    max: 6
  },
  slots: [{
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "12:00"
    isAvailable: { type: Boolean, default: true }
  }],
  slotDuration: {
    type: Number,
    required: [true, 'Slot duration in minutes is required'],
    default: 30
  }
}, { timestamps: true });

// Prevent duplicate availability for same doctor, branch, and day
availabilitySchema.index({ doctorId: 1, branchId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
