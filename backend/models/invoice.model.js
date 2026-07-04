const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['consultation', 'medicine', 'laboratory', 'other'],
    required: [true, 'Item category is required']
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0
  },
  amount: {
    type: Number,
    required: [true, 'Item amount is required'],
    min: 0
  }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    trim: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  items: {
    type: [invoiceItemSchema],
    default: []
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'],
    default: 'DRAFT'
  },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Auto-generate invoice number before saving
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
  // Recalculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  if (this.discountType === 'percentage') {
    this.discountAmount = parseFloat(((this.subtotal * this.discountValue) / 100).toFixed(2));
  } else {
    this.discountAmount = this.discountValue;
  }
  const afterDiscount = this.subtotal - this.discountAmount;
  this.taxAmount = parseFloat(((afterDiscount * this.taxRate) / 100).toFixed(2));
  this.totalAmount = parseFloat((afterDiscount + this.taxAmount).toFixed(2));
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
