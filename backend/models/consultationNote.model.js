const mongoose = require('mongoose');

const consultationNoteSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    senderRole: {
      type: String,
      enum: ['DOCTOR', 'PATIENT'],
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Compound index for fast thread fetch
consultationNoteSchema.index({ patientId: 1, doctorId: 1, createdAt: 1 });

module.exports = mongoose.model('ConsultationNote', consultationNoteSchema);
