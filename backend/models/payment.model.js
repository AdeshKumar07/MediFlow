const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: [true, 'Invoice reference is required']
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient reference is required']
  },
  razorpayOrderId: {
    type: String,
    trim: true,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    trim: true,
    default: null
  },
  razorpaySignature: {
    type: String,
    trim: true,
    default: null
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    trim: true
  },
  status: {
    type: String,
    enum: ['CREATED', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'CREATED'
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: null // e.g., 'upi', 'card', 'netbanking'
  },
  failureReason: {
    type: String,
    trim: true,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  receiptNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

// Auto-generate receipt number on success
paymentSchema.pre('save', async function (next) {
  if (this.status === 'SUCCESS' && !this.receiptNumber) {
    const count = await mongoose.model('Payment').countDocuments({ status: 'SUCCESS' });
    this.receiptNumber = `RCP-${String(count + 1).padStart(6, '0')}`;
    if (!this.paidAt) this.paidAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
