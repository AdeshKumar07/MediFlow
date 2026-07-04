const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: 0,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  batchNumber: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  dosage: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
